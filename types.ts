// Shared domain types for futbolgirlx.
// Clubs AND players are both tradable entities (Prompts 9-10).

export type LeagueId =
  | 'nwsl' | 'wsl' | 'uwcl' | 'liga-mx-femenil' | 'nwsl2'
  | 'damallsvenskan' | 'serie-a-fem' | 'liga-bpi' | 'liga-f' | 'usl-w' | 'nsl';

/** ISO 3166-1 alpha-2 country code, used to render flags. */
export type CountryCode = 'us' | 'gb' | 'mx' | 'se' | 'it' | 'pt' | 'es' | 'ca' | 'eu';

/** Whether a league's most recent season is still in progress. */
export type SeasonStatus = 'live' | 'finished';

export interface League {
  id: LeagueId;
  name: string;
  shortName: string;
  country: string;
  countryCode: CountryCode;
  active: boolean;
  seasonStatus: SeasonStatus;
  blurb: string;
  accent: string; // hex
}

export interface PricePoint {
  t: number; // unix ms
  p: number; // price
}

export interface Fixture {
  id: string;
  opponent: string;
  opponentAbbr: string;
  home: boolean;
  competition: string;
  date: string; // ISO
}

/** Display-only player row shown on Club Detail. Maps 1:1 to a full Player record by id. */
export interface KeyPlayer {
  id: string;
  name: string;
  position: string;
  number: number;
  rating: number; // 0-10
}

// --- Tradable entity (shared by clubs & players) -----------------------------

export type TradableKind = 'club' | 'player';

/** The market-relevant slice shared by Club and Player. The TradeSheet takes this. */
export interface Tradable {
  kind: TradableKind;
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  brandColor: string;
  brandColor2: string;
  basePrice: number;
  totalShares: number;
  sharesAvailable: number;
  performanceScore: number; // 0..1
  priceHistory: PricePoint[];
  buzz: number; // 0..100
}

export interface Club extends Tradable {
  kind: 'club';
  leagueId: LeagueId;
  city: string;
  // real-world info (sourced from Wikipedia / club pages)
  stadium: string;
  stadiumCapacity: number;
  stadiumAddress: string;
  foundedYear: number;
  avgAttendance: number; // most recent season
  // standings
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  fixtures: Fixture[];
  keyPlayers: KeyPlayer[];
}

export interface Player extends Tradable {
  kind: 'player';
  clubId: string;
  position: string;
  number: number;
  age: number;
  nationality: string;
  // current season stats
  season: string;
  goals: number;
  assists: number;
  minutes: number;
  appearances: number;
}

// --- Holdings (generalized for clubs + players) ------------------------------

export interface Holding {
  kind: TradableKind;
  refId: string; // club id or player id
  parentId?: string; // club id for player holdings (for display)
  shares: number;
  avgBuyPrice: number;
}

export interface Portfolio {
  cash: number;
  holdings: Holding[];
}

export type TradeSide = 'buy' | 'sell';

export interface TradeResult {
  ok: boolean;
  side: TradeSide;
  kind: TradableKind;
  refId: string;
  shares: number;
  price: number; // execution price per share
  total: number;
  newCash: number;
  newSharesAvailable: number;
  newPrice: number;
  message: string;
}

// --- Analytics (Prompt 12) ---------------------------------------------------

export interface LeaguePositionPoint {
  season: number;
  position: number; // 1..N
}

export interface SeasonValue {
  season: number;
  value: number;
}

export interface CoachTenure {
  id: string;
  coach: string;
  startSeason: number;
  endSeason: number | null; // null = current
}

export interface ClubAnalytics {
  leaguePositions: LeaguePositionPoint[];
  squadValueTrend: SeasonValue[]; // value in $M (virtual)
  playerTurnover: SeasonValue[]; // turnoverPct 0..100 per season
  attendanceTrend: SeasonValue[]; // avg attendance per season
  coachTenure: CoachTenure[];
}

// --- Navigation --------------------------------------------------------------

export type Screen =
  | 'splash'
  | 'walkthrough'
  | 'choose-league'
  | 'landing'
  | 'league-home'
  | 'club-detail'
  | 'player-profile'
  | 'compare'
  | 'portfolio'
  | 'about'
  | 'how-to-use'
  | 'disclaimer';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'error' | 'info';
}

/** Narrow a Club | Player to the shared Tradable slice. */
export function asTradable(e: Club | Player): Tradable {
  return {
    kind: e.kind,
    id: e.id,
    name: e.name,
    shortName: e.shortName,
    abbr: e.abbr,
    brandColor: e.brandColor,
    brandColor2: e.brandColor2,
    basePrice: e.basePrice,
    totalShares: e.totalShares,
    sharesAvailable: e.sharesAvailable,
    performanceScore: e.performanceScore,
    priceHistory: e.priceHistory,
    buzz: e.buzz,
  };
}
