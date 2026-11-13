// App configuration & feature flags.
// API keys are intentionally empty stubs — fill in at the end.

export const APP_NAME = 'futbolgirlx';

/** Switch the entire data layer between mock JSON and a live API-Football provider. */
export const USE_MOCK_DATA = true;

/** When set, persists portfolio + onboarding state to localStorage. */
export const PERSIST_STATE = true;

/** API-Football (live provider) — stub for now. */
export const API_FOOTBALL_KEY = '';
export const API_FOOTBALL_HOST = 'v3.football.api-sports.io';
export const API_FOOTBALL_BASE = `https://${API_FOOTBALL_HOST}`;

/** DeepSeek API — stub for now. Powers club "buzz" commentary and narratives. */
export const DEEPSEEK_API_KEY = '';
export const DEEPSEEK_API_BASE = 'https://api.deepseek.com';
export const DEEPSEEK_MODEL = 'deepseek-chat';

/** Trading simulation constants (Section 2 — scarcity model). */
export const TRADING = {
  STARTING_CASH: 10000,
  TOTAL_SHARES_PER_CLUB: 1000,
  MAX_SCARCITY_PREMIUM: 1.5, // price can rise up to 2.5x base as shares sell out
  TRADING_FEE_BPS: 0, // fee in basis points (0 = no fee for the demo)
} as const;
