// Shared Buy/Sell bottom-sheet (Prompt 10).
// Works for ANY Tradable entity — clubs OR players — using the same scarcity
// multiplier formula (applied to sharesAvailable/totalShares). One component,
// not a duplicated copy of the club flow.

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Sheet } from '../components/Sheet';
import { Button, Badge } from '../components/ui';
import { ClubLogo } from '../components/ClubLogo';
import type { Tradable, TradeSide } from '../types';
import { computePrice, costForShares, sharesForAmount } from '../lib/pricing';

export function TradeSheet({
  open, side, entity, onClose,
}: {
  open: boolean;
  side: TradeSide;
  entity: Tradable | null;
  onClose: () => void;
}) {
  const { portfolio, executeTradeByShares, pushToast } = useApp();
  const [amount, setAmount] = useState('');

  useEffect(() => { if (open) setAmount(''); }, [open, side, entity?.id]);

  if (!entity) return null;
  const price = computePrice(entity);
  const holding = portfolio.holdings.find((h) => h.kind === entity.kind && h.refId === entity.id);
  const amt = parseFloat(amount) || 0;
  const shares = sharesForAmount(amt, price);
  const cost = costForShares(shares, price);

  const quick = side === 'buy' ? [100, 250, 500, 1000] : [];
  const maxSellShares = holding?.shares ?? 0;
  const maxSellValue = costForShares(maxSellShares, price);

  const valid = side === 'buy'
    ? shares > 0 && shares <= entity.sharesAvailable && cost <= portfolio.cash
    : shares > 0 && shares <= maxSellShares;

  function confirm() {
    const res = executeTradeByShares(side, entity!.kind, entity!.id, shares);
    if (res.ok) {
      pushToast({
        tone: 'success',
        title: `${side === 'buy' ? 'Bought' : 'Sold'} ${res.shares} ${entity!.shortName} ${res.shares === 1 ? 'share' : 'shares'}`,
        body: `@ $${res.price.toFixed(2)} • New price $${res.newPrice.toFixed(2)} • Cash $${res.newCash.toFixed(2)}`,
      });
      onClose();
    } else {
      pushToast({ tone: 'error', title: 'Order rejected', body: res.message });
    }
  }

  const label = entity.kind === 'player' ? 'player shares' : 'shares';

  return (
    <Sheet
      open={open} onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {side === 'buy' ? <ArrowUp size={18} className="text-success-500" /> : <ArrowDown size={18} className="text-error-500" />}
          {side === 'buy' ? 'Buy' : 'Sell'} {entity.shortName}
        </span>
      }
      footer={
        <Button block size="lg" variant={side === 'buy' ? 'success' : 'danger'} disabled={!valid} onClick={confirm}>
          {side === 'buy' ? `Buy ${shares > 0 ? shares : ''} ${shares === 1 ? 'share' : 'shares'}` : 'Confirm sell'}
        </Button>
      }
    >
      {/* entity header */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 mb-4">
        <ClubLogo abbr={entity.abbr} color={entity.brandColor} color2={entity.brandColor2} size={40} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{entity.shortName}</p>
            <Badge tone={entity.kind === 'player' ? 'sky' : 'brand'}>{entity.kind}</Badge>
          </div>
          <p className="text-xs text-ink-400">{entity.sharesAvailable} / {entity.totalShares} {label} available</p>
        </div>
        <div className="text-right">
          <p className="font-bold tabular">${price.toFixed(2)}</p>
          <p className="text-[11px] text-ink-400">per share</p>
        </div>
      </div>

      {/* balance / holding context */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-xs">
        <Wallet size={14} className="text-ink-400" />
        <span className="text-ink-500 dark:text-ink-400">Cash:</span>
        <span className="font-semibold tabular">${portfolio.cash.toFixed(2)}</span>
        {side === 'sell' && (
          <>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500 dark:text-ink-400">You own:</span>
            <span className="font-semibold tabular">{holding?.shares ?? 0} {label}</span>
          </>
        )}
      </div>

      {/* amount input */}
      <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1.5">
        Amount (USD)
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-display font-bold text-ink-400">$</span>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          className="w-full h-14 pl-8 pr-3 rounded-2xl bg-ink-100 dark:bg-ink-800 font-display font-extrabold text-2xl tabular focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {side === 'buy' && (
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className={`tap tap-scale h-9 rounded-lg text-sm font-semibold ${amt === q ? 'bg-primary-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}
            >
              ${q}
            </button>
          ))}
        </div>
      )}

      {side === 'sell' && (
        <button
          onClick={() => setAmount(String(maxSellValue))}
          className="tap tap-scale mt-2.5 w-full h-9 rounded-lg bg-ink-100 dark:bg-ink-800 text-sm font-semibold text-ink-600 dark:text-ink-300"
        >
          Sell all ({maxSellShares} {label} = ${maxSellValue.toFixed(2)})
        </button>
      )}

      {/* live calculation */}
      <div className="mt-4 p-3.5 rounded-2xl border border-ink-100 dark:border-ink-800 space-y-2">
        <Row label="Shares" value={`${shares}`} />
        <Row label="Price per share" value={`$${price.toFixed(2)}`} />
        <Row label="Est. total" value={`$${cost.toFixed(2)}`} strong />
        {side === 'buy' && shares > entity.sharesAvailable && (
          <p className="text-xs text-error-600 font-semibold">Only {entity.sharesAvailable} {label} available on the market.</p>
        )}
        {side === 'buy' && cost > portfolio.cash && (
          <p className="text-xs text-error-600 font-semibold">Not enough cash. Balance: ${portfolio.cash.toFixed(2)}.</p>
        )}
        {side === 'sell' && shares > maxSellShares && (
          <p className="text-xs text-error-600 font-semibold">You only own {maxSellShares} {label}.</p>
        )}
        {side === 'buy' && valid && (
          <p className="text-xs text-success-600 font-semibold pt-1 border-t border-ink-100 dark:border-ink-800">
            After this buy: {entity.sharesAvailable - shares} left → new price ≈ ${computePrice({ ...entity, sharesAvailable: entity.sharesAvailable - shares }).toFixed(2)}
          </p>
        )}
      </div>

      {side === 'buy' && holding && (
        <p className="mt-3 text-xs text-ink-400 text-center">
          You already own <Badge tone="brand">{holding.shares} {label}</Badge> @ avg ${holding.avgBuyPrice.toFixed(2)}.
        </p>
      )}
    </Sheet>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500 dark:text-ink-400">{label}</span>
      <span className={`tabular ${strong ? 'font-display font-extrabold text-base' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}
