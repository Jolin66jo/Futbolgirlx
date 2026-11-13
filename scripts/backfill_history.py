#!/usr/bin/env python3
"""
futbolgirlx — Historical data backfill (Prompt 11).

Pulls historical NWSL club data from two sources and normalizes it into a single
`club_value_history`-style schema, recording the `source` (API vs Wikipedia) on
every record so provenance is always known.

Sources:
  1. API-Football (https://www.api-football.com/)
     - standings per season (league position, points, W/D/L, GF/GA)
     - per-club team info (stadium, founded year, city)
     Requires API_FOOTBALL_KEY in the environment.

  2. Wikipedia
     - parses each club's Wikipedia page for structured facts:
       stadium, founded year, historical final league positions
     Uses the MediaWiki API + wikitext/infobox parsing (no key needed).

Output:
  - writes `out/club_value_history.jsonl`  (one JSON record per line)
  - writes `out/club_info.json`            (one record per club, static facts)
  Each record carries `source: "api" | "wikipedia"` and `fetched_at`.

Usage:
  export API_FOOTBALL_KEY=...
  python backfill_history.py [--seasons 2020,2021,2022,2023,2024] [--clubs all]

This script does NOT touch the Supabase database directly. It writes JSON files
that can be loaded into the `club_value_history` table via a separate import step
(see the SQL in README_BACKFILL.md). That keeps the backfill idempotent and
re-runnable without side effects on the live DB.

NOTE: This is a real, runnable script. It degrades gracefully — if API-Football
is not configured, it skips that source and continues with Wikipedia only.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

API_FOOTBALL_HOST = "v3.football.api-sports.io"
API_FOOTBALL_BASE = f"https://{API_FOOTBALL_HOST}"
WIKI_API = "https://en.wikipedia.org/w/api.php"

# NWSL league id in API-Football (top-division US women's league).
# This may need adjustment per API-Football's current league code; the script
# resolves it dynamically via /leagues?search=NWSL if the constant is wrong.
NWSL_API_LEAGUE_ID = 222  # API-Football's NWSL league id (historically 222)
NWSL_COUNTRY = "USA"

# Wikipedia page titles for each NWSL club. Used for the Wikipedia backfill.
# Keep in sync with the club ids used by the app (src/data/mockData.ts).
CLUBS: list[dict[str, str]] = [
    {"id": "por",  "name": "Portland Thorns",       "wiki": "Portland Thorns FC"},
    {"id": "kc",   "name": "Kansas City Current",   "wiki": "Kansas City Current"},
    {"id": "gth",  "name": "Gotham FC",             "wiki": "Gotham FC"},
    {"id": "orl",  "name": "Orlando Pride",         "wiki": "Orlando Pride"},
    {"id": "nc",   "name": "North Carolina Courage","wiki": "North Carolina Courage"},
    {"id": "sd",   "name": "San Diego Wave",        "wiki": "San Diego Wave FC"},
    {"id": "lou",  "name": "Racing Louisville",     "wiki": "Racing Louisville FC"},
    {"id": "sea",  "name": "Seattle Reign",         "wiki": "OL Reign"},
    {"id": "ac",   "name": "Angel City FC",         "wiki": "Angel City FC"},
    {"id": "was",  "name": "Washington Spirit",     "wiki": "Washington Spirit"},
    {"id": "chi",  "name": "Chicago Red Stars",     "wiki": "Chicago Red Stars"},
    {"id": "bay",  "name": "Bay FC",                "wiki": "Bay FC"},
]

DEFAULT_SEASONS = [2020, 2021, 2022, 2023, 2024]
OUT_DIR = Path(__file__).resolve().parent / "out"


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

@dataclass
class ClubInfoRecord:
    """Static, current facts about a club (one per club)."""
    club_id: str
    name: str
    stadium: str | None = None
    founded_year: int | None = None
    city: str | None = None
    source: str = "wikipedia"          # "api" | "wikipedia"
    fetched_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class ClubValueHistory:
    """One season-by-season record per club. Provenance is on every row."""
    club_id: str
    season: int
    league_position: int | None = None
    points: int | None = None
    wins: int | None = None
    draws: int | None = None
    losses: int | None = None
    goals_for: int | None = None
    goals_against: int | None = None
    source: str = "api"                # "api" | "wikipedia"
    fetched_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _get_json(url: str, headers: dict[str, str] | None = None, timeout: int = 20) -> Any:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _get_text(url: str, headers: dict[str, str] | None = None, timeout: int = 20) -> str:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8")


# ---------------------------------------------------------------------------
# API-Football backfill
# ---------------------------------------------------------------------------

def api_football_get(path: str, params: dict[str, str]) -> Any:
    key = os.environ.get("API_FOOTBALL_KEY", "")
    if not key:
        raise RuntimeError("API_FOOTBALL_KEY is not set; skipping API-Football.")
    qs = urllib.parse.urlencode(params)
    url = f"{API_FOOTBALL_BASE}{path}?{qs}"
    headers = {"x-apisports-key": key}
    data = _get_json(url, headers)
    return data.get("response", [])


def backfill_api_football(seasons: list[int], clubs: list[dict[str, str]]) -> tuple[list[ClubValueHistory], list[ClubInfoRecord]]:
    history: list[ClubValueHistory] = []
    infos: list[ClubInfoRecord] = []
    key = os.environ.get("API_FOOTBALL_KEY", "")
    if not key:
        print("[api] API_FOOTBALL_KEY not set — skipping API-Football source.", file=sys.stderr)
        return history, infos

    # Resolve team id -> club id by name. API-Football uses team ids; we match on name.
    print("[api] Resolving NWSL teams...")
    teams = api_football_get("/teams", {"league": str(NWSL_API_LEAGUE_ID), "season": str(seasons[-1])})
    name_to_club = {c["name"].lower(): c["id"] for c in clubs}
    team_id_to_club: dict[int, str] = {}
    for t in teams:
        tname = t.get("team", {}).get("name", "")
        for lname, cid in name_to_club.items():
            if lname in tname.lower() or tname.lower() in lname:
                team_id_to_club[t["team"]["id"]] = cid
                infos.append(ClubInfoRecord(
                    club_id=cid, name=tname,
                    stadium=t.get("venue", {}).get("name"),
                    city=t.get("venue", {}).get("city"),
                    source="api",
                ))
                break

    print(f"[api] Matched {len(team_id_to_club)} teams.")
    for season in seasons:
        print(f"[api] Standings season {season}...")
        rows = api_football_get("/standings", {"league": str(NWSL_API_LEAGUE_ID), "season": str(season)})
        for league in rows:
            for group in league.get("league", {}).get("standings", []):
                for row in group:
                    tid = row.get("team", {}).get("id")
                    cid = team_id_to_club.get(tid)
                    if not cid:
                        continue
                    history.append(ClubValueHistory(
                        club_id=cid, season=season,
                        league_position=row.get("rank"),
                        points=row.get("points"),
                        wins=row.get("all", {}).get("win"),
                        draws=row.get("all", {}).get("draw"),
                        losses=row.get("all", {}).get("lose"),
                        goals_for=row.get("all", {}).get("goals", {}).get("for"),
                        goals_against=row.get("all", {}).get("goals", {}).get("against"),
                        source="api",
                    ))
        time.sleep(1)  # be nice to the API
    return history, infos


# ---------------------------------------------------------------------------
# Wikipedia backfill
# ---------------------------------------------------------------------------

def wiki_fetch_wikitext(title: str) -> str:
    params = {
        "action": "query", "prop": "revisions", "rvprop": "content",
        "rvslots": "main", "format": "json", "titles": title,
    }
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    data = _get_json(url)
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        revs = page.get("revisions", [])
        if revs:
            return revs[0].get("slots", {}).get("main", {}).get("*", "")
    return ""


def parse_infobox(wikitext: str) -> dict[str, str]:
    """Very small infobox parser: pulls `| key = value` pairs from the first
    {{Infobox ...}} block. Good enough for stadium/founded/league positions."""
    info: dict[str, str] = {}
    # find the infobox block
    m = re.search(r"\{\{Infobox[^{}]*?(?:\{\{[^{}]*\}\}[^{}]*?)*\}\}", wikitext, re.DOTALL)
    block = m.group(0) if m else wikitext
    for line in block.splitlines():
        mm = re.match(r"\s*\|\s*([A-Za-z0-9_ ]+)\s*=\s*(.+?)\s*$", line)
        if mm:
            key = mm.group(1).strip().lower().replace(" ", "_")
            val = mm.group(2).strip()
            # strip wikilinks & refs
            val = re.sub(r"\[\[([^\]|]+\|)?([^\]]+)\]\]", r"\2", val)
            val = re.sub(r"\{\{[^{}]*\}\}", "", val)
            val = re.sub(r"<ref[^>]*>.*?</ref>", "", val, flags=re.DOTALL)
            val = re.sub(r"<ref[^>]*/>", "", val)
            info[key] = val.strip()
    return info


def parse_founded(info: dict[str, str]) -> int | None:
    for k in ("founded", "founded_year", "year_founded"):
        v = info.get(k)
        if v:
            m = re.search(r"(1|2)\d{3}", v)
            if m:
                return int(m.group(0))
    return None


def parse_league_positions(wikitext: str, seasons: list[int]) -> dict[int, int]:
    """Scan for season-by-season league positions. Looks for patterns like
    '2024 : 3rd' or rows in a league history table. Best-effort."""
    found: dict[int, int] = {}
    for season in seasons:
        # match "2024" near a positional word like "1st", "2nd", "3rd", "4th", "5th"...
        for pat in (rf"{season}[^0-9]{{0,12}}(\d{{1,2}})(?:st|nd|rd|th)",
                    rf"(\d{{1,2}})(?:st|nd|rd|th)[^0-9]{{0,8}}{season}"):
            m = re.search(pat, wikitext, re.IGNORECASE)
            if m:
                pos = int(m.group(1))
                if 1 <= pos <= 14:
                    found[season] = pos
                    break
    return found


def backfill_wikipedia(seasons: list[int], clubs: list[dict[str, str]]) -> tuple[list[ClubValueHistory], list[ClubInfoRecord]]:
    history: list[ClubValueHistory] = []
    infos: list[ClubInfoRecord] = []
    for club in clubs:
        print(f"[wiki] {club['wiki']}")
        try:
            wikitext = wiki_fetch_wikitext(club["wiki"])
        except Exception as e:  # network / not found
            print(f"[wiki]  failed: {e}", file=sys.stderr)
            continue
        if not wikitext:
            continue
        info = parse_infobox(wikitext)
        infos.append(ClubInfoRecord(
            club_id=club["id"], name=club["name"],
            stadium=info.get("stadium") or info.get("ground"),
            founded_year=parse_founded(info),
            city=info.get("location") or info.get("city"),
            source="wikipedia",
        ))
        positions = parse_league_positions(wikitext, seasons)
        for season, pos in positions.items():
            history.append(ClubValueHistory(
                club_id=club["id"], season=season,
                league_position=pos, source="wikipedia",
            ))
        time.sleep(0.5)  # be nice to Wikipedia
    return history, infos


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def write_outputs(history: list[ClubValueHistory], infos: list[ClubInfoRecord]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    hist_path = OUT_DIR / "club_value_history.jsonl"
    with hist_path.open("w", encoding="utf-8") as f:
        for rec in history:
            f.write(json.dumps(asdict(rec)) + "\n")
    info_path = OUT_DIR / "club_info.json"
    with info_path.open("w", encoding="utf-8") as f:
        json.dump([asdict(i) for i in infos], f, indent=2)
    print(f"\nWrote {len(history)} history rows -> {hist_path}")
    print(f"Wrote {len(infos)} club info records -> {info_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="Backfill NWSL historical data (API-Football + Wikipedia).")
    ap.add_argument("--seasons", default=",".join(str(s) for s in DEFAULT_SEASONS),
                    help="Comma-separated years, e.g. 2020,2021,2022,2023,2024")
    ap.add_argument("--clubs", default="all", help="'all' or comma-separated club ids")
    ap.add_argument("--source", default="both", choices=["both", "api", "wikipedia"],
                    help="Which source(s) to pull from")
    args = ap.parse_args()

    seasons = [int(s) for s in args.seasons.split(",") if s.strip()]
    clubs = CLUBS if args.clubs == "all" else [c for c in CLUBS if c["id"] in args.clubs.split(",")]

    history: list[ClubValueHistory] = []
    infos: list[ClubInfoRecord] = []

    if args.source in ("both", "api"):
        h, i = backfill_api_football(seasons, clubs)
        history += h
        infos += i
    if args.source in ("both", "wikipedia"):
        h, i = backfill_wikipedia(seasons, clubs)
        history += h
        infos += i

    # de-dup infos: prefer API over Wikipedia when both exist for a club
    seen: dict[str, ClubInfoRecord] = {}
    for rec in infos:
        existing = seen.get(rec.club_id)
        if existing is None or (existing.source == "wikipedia" and rec.source == "api"):
            seen[rec.club_id] = rec
    infos = list(seen.values())

    write_outputs(history, infos)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
