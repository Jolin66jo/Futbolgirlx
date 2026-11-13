// Data service abstraction (Prompt 8).
// UI components import from `data/index.ts` and get either the mock or the live
// provider depending on USE_MOCK_DATA. No UI code ever touches the flag directly.
//
// Extended in Prompts 9-12 to also serve players + analytics.

import type { Club, ClubAnalytics, League, Player, Tradable } from '../types';
import { USE_MOCK_DATA } from '../config';
import {
  mockClubsForLeague, MOCK_CLUBS, MOCK_CLUBS_BY_ID, MOCK_ANALYTICS,
  MOCK_PLAYERS, MOCK_PLAYERS_BY_ID, mockPlayersForClub,
  LEAGUES as MOCK_LEAGUES,
} from './mockData';

export interface DataService {
  listLeagues(): Promise<League[]>;
  listClubs(leagueId: string): Promise<Club[]>;
  getClub(clubId: string): Promise<Club | null>;
  listPlayers(clubId: string): Promise<Player[]>;
  getPlayer(playerId: string): Promise<Player | null>;
  getAnalytics(clubId: string): Promise<ClubAnalytics | null>;
  /** Optional: return a "buzz" narrative (DeepSeek). Stubbed in mock. */
  getBuzz(entity: Tradable): Promise<string>;
}

// ---- Mock provider ------------------------------------------------------------

const MockProvider: DataService = {
  async listLeagues() { return MOCK_LEAGUES; },
  async listClubs(leagueId) { return mockClubsForLeague(leagueId as League['id']); },
  async getClub(clubId) { return MOCK_CLUBS_BY_ID[clubId] ?? null; },
  async listPlayers(clubId) { return mockPlayersForClub(clubId); },
  async getPlayer(playerId) { return MOCK_PLAYERS_BY_ID[playerId] ?? null; },
  async getAnalytics(clubId) { return MOCK_ANALYTICS[clubId] ?? null; },
  async getBuzz(_entity) {
    return 'Buzz is generated locally in mock mode. Connect DeepSeek for live narrative.';
  },
};

// ---- Live provider (API-Football + DeepSeek) — STUB --------------------------
// Keys are empty stubs for now. Swap the implementation bodies when keys are set.

const LiveProvider: DataService = {
  async listLeagues() {
    // TODO: fetch NWSL from API-Football `/leagues`. Map to League; hardcode gating.
    return MOCK_LEAGUES;
  },
  async listClubs(_leagueId) {
    // TODO: teams + standings + fixtures from API-Football; buzz from DeepSeek.
    return [];
  },
  async getClub(_clubId) {
    // TODO: assemble a single Club from API-Football + DeepSeek.
    return null;
  },
  async listPlayers(_clubId) {
    // TODO: API-Football `/players?team=...&season=...` -> Player markets.
    return [];
  },
  async getPlayer(_playerId) {
    return null;
  },
  async getAnalytics(_clubId) {
    // TODO: backfill from the Python script output (Prompt 11) stored in Supabase.
    return null;
  },
  async getBuzz(_entity) {
    // TODO: POST to DeepSeek chat completions with a fan-interest prompt.
    return 'Live buzz unavailable until DeepSeek API key is configured.';
  },
};

export const dataService: DataService = USE_MOCK_DATA ? MockProvider : LiveProvider;

export { MOCK_CLUBS, MOCK_CLUBS_BY_ID, MOCK_PLAYERS, MOCK_ANALYTICS };
