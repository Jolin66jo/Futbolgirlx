// Scarcity-driven pricing model (Section 2 of the spec).
// Applies identically to clubs AND players (Prompt 10) via the shared Tradable slice.
//
// Current price = basePrice * performanceMultiplier * scarcityMultiplier
//
//   performanceMultiplier = 0.8 + 1.4 * performanceScore   (range 0.8x .. 2.2x)
//   scarcityMultiplier    = 1 + MAX_PREMIUM * (1 - sharesAvailable/totalShares)
//
// As shares sell out, the multiplier climbs from 1.0x up to (1 + MAX_PREMIUM)x.

import { TRADING } from '../config';
import type { Tradable } from '../types';

export function performanceMultiplier(e: Pick<Tradable, 'performanceScore'>): number {
  const s = clamp01(e.performanceScore);
  return 0.8 + 1.4 * s;
}

export function scarcityMultiplier(sharesAvailable: number, totalShares: number): number {
  const sold = 1 - sharesAvailable / totalShares;
  return 1 + TRADING.MAX_SCARCITY_PREMIUM * clamp01(sold);
}

export function computePrice(e: Pick<Tradable, 'basePrice' | 'performanceScore' | 'sharesAvailable' | 'totalShares'>): number {
  return (
    e.basePrice *
    performanceMultiplier(e) *
    scarcityMultiplier(e.sharesAvailable, e.totalShares)
  );
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function sharesForAmount(amount: number, price: number): number {
  if (price <= 0) return 0;
  return Math.floor(amount / price);
}

export function costForShares(shares: number, price: number): number {
  return round2(shares * price);
}

export function pctChange(latest: number, prev: number): number {
  if (prev === 0) return 0;
  return ((latest - prev) / prev) * 100;
}

export function change24h(history: { p: number }[]): number {
  if (history.length < 2) return 0;
  return pctChange(history[history.length - 1].p, history[history.length - 2].p);
}
