// Global app state: navigation, portfolio (cash + holdings), live markets for
// clubs AND players, dark mode, toasts, and kind-aware trade execution.
//
// Holdings are generalized (Prompt 10): a Holding carries `kind` + `refId` so
// the same portfolio list and trade execution path serve clubs and players.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TRADING, PERSIST_STATE } from '../config';
import type {
  Club, Holding, Player, Portfolio, Screen, Toast, Tradable,
  TradeResult, TradeSide, TradableKind,
} from '../types';
import { computePrice, costForShares, round2, sharesForAmount } from '../lib/pricing';
import {
  MOCK_CLUBS, MOCK_PLAYERS, MOCK_CLUBS_BY_ID, MOCK_PLAYERS_BY_ID,
} from '../data/mockData';

interface AppState {
  // navigation
  screen: Screen;
  selectedLeagueId: string;
  selectedClubId: string | null;
  selectedPlayerId: string | null;
  navigate: (screen: Screen, opts?: { clubId?: string; leagueId?: string; playerId?: string }) => void;

  // onboarding
  onboarded: boolean;
  completeOnboarding: () => void;

  // theme
  dark: boolean;
  toggleDark: () => void;

  // markets — working copies so trades mutate available shares & price
  clubs: Club[];
  players: Player[];
  getClub: (id: string) => Club | undefined;
  getPlayer: (id: string) => Player | undefined;
  getTradable: (kind: TradableKind, id: string) => Tradable | undefined;

  // portfolio
  portfolio: Portfolio;
  cash: number;

  // trading (kind-aware)
  executeTrade: (side: TradeSide, kind: TradableKind, refId: string, amountDollars: number) => TradeResult;
  executeTradeByShares: (side: TradeSide, kind: TradableKind, refId: string, shares: number) => TradeResult;

  // toasts
  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

const START_PORTFOLIO: Portfolio = { cash: TRADING.STARTING_CASH, holdings: [] };

function loadPersisted<T>(key: string, fallback: T): T {
  if (!PERSIST_STATE) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function savePersisted<T>(key: string, val: T) {
  if (!PERSIST_STATE) return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>(() => loadPersisted<Screen>('fx_screen', 'splash'));
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('nwsl');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState<boolean>(() => loadPersisted<boolean>('fx_onboarded', false));
  const [dark, setDark] = useState<boolean>(() => loadPersisted<boolean>('fx_dark', false));
  const [clubs, setClubs] = useState<Club[]>(() => loadPersisted<Club[]>('fx_clubs', MOCK_CLUBS));
  const [players, setPlayers] = useState<Player[]>(() => loadPersisted<Player[]>('fx_players', MOCK_PLAYERS));
  const [portfolio, setPortfolio] = useState<Portfolio>(() => loadPersisted<Portfolio>('fx_portfolio', START_PORTFOLIO));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => savePersisted('fx_screen', screen), [screen]);
  useEffect(() => savePersisted('fx_onboarded', onboarded), [onboarded]);
  useEffect(() => savePersisted('fx_dark', dark), [dark]);
  useEffect(() => savePersisted('fx_clubs', clubs), [clubs]);
  useEffect(() => savePersisted('fx_players', players), [players]);
  useEffect(() => savePersisted('fx_portfolio', portfolio), [portfolio]);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
  }, [dark]);

  const navigate = (next: Screen, opts?: { clubId?: string; leagueId?: string; playerId?: string }) => {
    if (opts?.clubId) setSelectedClubId(opts.clubId);
    if (opts?.leagueId) setSelectedLeagueId(opts.leagueId);
    if (opts?.playerId) setSelectedPlayerId(opts.playerId);
    setScreen(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const completeOnboarding = () => setOnboarded(true);
  const toggleDark = () => setDark((d) => !d);

  const getClub = (id: string) => clubs.find((c) => c.id === id) ?? MOCK_CLUBS_BY_ID[id];
  const getPlayer = (id: string) => players.find((p) => p.id === id) ?? MOCK_PLAYERS_BY_ID[id];
  const getTradable = (kind: TradableKind, id: string): Tradable | undefined => {
    if (kind === 'club') { const c = getClub(id); return c ? { ...c } : undefined; }
    const p = getPlayer(id);
    return p ? { ...p } : undefined;
  };

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3800);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  // --- Trading core (kind-aware) -------------------------------------------
  function updateMarket(kind: TradableKind, refId: string, newAvail: number, newPrice: number) {
    if (kind === 'club') {
      setClubs((prev) => prev.map((e) =>
        e.id === refId ? { ...e, sharesAvailable: newAvail, priceHistory: pushTick(e.priceHistory, newPrice) } : e,
      ));
    } else {
      setPlayers((prev) => prev.map((e) =>
        e.id === refId ? { ...e, sharesAvailable: newAvail, priceHistory: pushTick(e.priceHistory, newPrice) } : e,
      ));
    }
  }

  function executeTradeByShares(side: TradeSide, kind: TradableKind, refId: string, shares: number): TradeResult {
    const entity = getTradable(kind, refId);
    if (!entity) return fail(side, kind, refId, 'Entity not found.');
    if (shares <= 0) return fail(side, kind, refId, 'Enter an amount greater than zero.');

    const price = computePrice(entity);
    const total = costForShares(shares, price);

    if (side === 'buy') {
      if (shares > entity.sharesAvailable) return fail(side, kind, refId, 'Not enough shares available on the market.');
      if (total > portfolio.cash) return fail(side, kind, refId, 'Not enough cash for this order.');

      const newAvail = entity.sharesAvailable - shares;
      const newPrice = computePrice({ ...entity, sharesAvailable: newAvail });
      updateMarket(kind, refId, newAvail, newPrice);

      setPortfolio((prev) => {
        const h = prev.holdings.find((x) => x.kind === kind && x.refId === refId);
        let holdings: Holding[];
        if (h) {
          const totalShares = h.shares + shares;
          const totalCost = h.shares * h.avgBuyPrice + total;
          const avg = round2(totalCost / totalShares);
          holdings = prev.holdings.map((x) => (x.kind === kind && x.refId === refId ? { ...x, shares: totalShares, avgBuyPrice: avg } : x));
        } else {
          holdings = [...prev.holdings, { kind, refId, parentId: kind === 'player' ? (entity as Player).clubId : undefined, shares, avgBuyPrice: price }];
        }
        return { cash: round2(prev.cash - total), holdings };
      });

      return ok(side, kind, refId, shares, price, total, portfolio.cash - total, newAvail, newPrice, 'Buy filled.');
    } else {
      const h = portfolio.holdings.find((x) => x.kind === kind && x.refId === refId);
      if (!h || h.shares <= 0) return fail(side, kind, refId, 'You do not own any shares in this market.');
      if (shares > h.shares) return fail(side, kind, refId, 'You cannot sell more shares than you own.');

      const newAvail = Math.min(entity.totalShares, entity.sharesAvailable + shares);
      const newPrice = computePrice({ ...entity, sharesAvailable: newAvail });
      updateMarket(kind, refId, newAvail, newPrice);

      setPortfolio((prev) => {
        const holding = prev.holdings.find((x) => x.kind === kind && x.refId === refId)!;
        const remaining = holding.shares - shares;
        const holdings = remaining > 0
          ? prev.holdings.map((x) => (x.kind === kind && x.refId === refId ? { ...x, shares: remaining } : x))
          : prev.holdings.filter((x) => !(x.kind === kind && x.refId === refId));
        return { cash: round2(prev.cash + total), holdings };
      });

      return ok(side, kind, refId, shares, price, total, portfolio.cash + total, newAvail, newPrice, 'Sell filled.');
    }
  }

  function executeTrade(side: TradeSide, kind: TradableKind, refId: string, amountDollars: number): TradeResult {
    const entity = getTradable(kind, refId);
    if (!entity) return fail(side, kind, refId, 'Entity not found.');
    const price = computePrice(entity);
    let shares = sharesForAmount(amountDollars, price);
    if (side === 'sell') {
      const h = portfolio.holdings.find((x) => x.kind === kind && x.refId === refId);
      if (h) shares = Math.min(shares, h.shares);
    }
    return executeTradeByShares(side, kind, refId, shares);
  }

  const value = useMemo<AppState>(() => ({
    screen, selectedLeagueId, selectedClubId, selectedPlayerId, navigate,
    onboarded, completeOnboarding,
    dark, toggleDark,
    clubs, players, getClub, getPlayer, getTradable,
    portfolio, cash: portfolio.cash,
    executeTrade, executeTradeByShares,
    toasts, pushToast, dismissToast,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [screen, selectedLeagueId, selectedClubId, selectedPlayerId, onboarded, dark, clubs, players, portfolio, toasts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function pushTick(history: { t: number; p: number }[], price: number) {
  const next = history.slice(-29);
  next.push({ t: Date.now(), p: round2(price) });
  return next;
}

function ok(side: TradeSide, kind: TradableKind, refId: string, shares: number, price: number, total: number, newCash: number, newSharesAvailable: number, newPrice: number, message: string): TradeResult {
  return { ok: true, side, kind, refId, shares, price, total, newCash, newSharesAvailable, newPrice, message };
}
function fail(side: TradeSide, kind: TradableKind, refId: string, message: string): TradeResult {
  return { ok: false, side, kind, refId, shares: 0, price: 0, total: 0, newCash: 0, newSharesAvailable: 0, newPrice: 0, message };
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
