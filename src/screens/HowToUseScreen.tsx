// How to Use (Section 6 of the spec).

import { Search, ArrowUpCircle, ArrowDownCircle, TrendingUp, Wallet, Info } from 'lucide-react';
import { ContentPage, Section, P, UL, LI } from './ContentPage';

export function HowToUseScreen() {
  return (
    <ContentPage title="How to Use" subtitle="From signup to your first trade">
      <Section>
        <P>
          Here's the 60-second version of how futbolgirlx works, from the moment you open the app to your first trade.
        </P>
      </Section>

      <Section title="1. Pick a league">
        <P>
          After the quick walkthrough you'll land on the league picker. The NWSL is live now; other leagues are marked "Coming Soon." Tap the NWSL to enter.
        </P>
      </Section>

      <Section title="2. Browse clubs">
        <P>
          The League Home shows a standings table and a scrollable list of club cards. Each card shows the club's current share price and 24h change. Use the Standings / Market tabs to switch views, and the search bar to find a specific club.
        </P>
        <UL>
          <LI><Search size={14} className="inline mr-1.5 text-ink-400" />Tap any club to open its detail page.</LI>
        </UL>
      </Section>

      <Section title="3. Read a club's page">
        <P>
          The Club Detail page is where you decide whether to buy. You'll see:
        </P>
        <UL>
          <LI>A 30-day price history chart.</LI>
          <LI>A "shares available" bar showing how many of the club's limited shares are left \u2014 the fewer left, the higher the price.</LI>
          <LI>Upcoming fixtures and a short list of key players.</LI>
          <LI>A fan buzz index.</LI>
          <LI><Info size={14} className="inline mr-1.5 text-primary-500" />The "How is this valued?" button explains exactly how the price is calculated.</LI>
        </UL>
      </Section>

      <Section title="4. Buy shares">
        <P>
          Tap <span className="inline-flex items-center gap-1 font-semibold text-success-600"><ArrowUpCircle size={14} /> Buy</span> at the bottom. Enter a dollar amount \u2014 you'll see the number of shares that buys at the current price, plus the estimated new price after your order. Confirm to execute. Your cash balance drops and the shares land in your portfolio.
        </P>
      </Section>

      <Section title="5. Sell shares">
        <P>
          Tap <span className="inline-flex items-center gap-1 font-semibold text-error-600"><ArrowDownCircle size={14} /> Sell</span> to offload shares you own. You'll see your current holding and can sell some or all of it. Selling returns shares to the market and adds cash back to your balance.
        </P>
      </Section>

      <Section title="6. Watch scarcity move the price">
        <P>
          Every club has a fixed number of shares. As shares sell out, the price automatically rises \u2014 up to 2.5x the base. So getting in early on a popular club, before everyone else buys, is where the gains come from.
        </P>
        <UL>
          <LI><TrendingUp size={14} className="inline mr-1.5 text-primary-500" />Buying reduces available shares → price goes up.</LI>
          <LI>Selling returns shares → price comes back down.</LI>
        </UL>
      </Section>

      <Section title="7. Track your portfolio">
        <P>
          <Wallet size={14} className="inline mr-1.5 text-secondary-500" />The Portfolio tab shows your cash balance, every club you hold shares in, the current value, and your gain or loss since you bought. The total at the top is cash + holdings combined.
        </P>
      </Section>

      <Section title="Tips">
        <UL>
          <LI>Check the shares-available bar before buying \u2014 a club that's almost sold out is pricier but may keep climbing.</LI>
          <LI>Watch the buzz index \u2014 rising buzz often precedes price moves.</LI>
          <LI>You can't lose real money. Experiment, take risks, learn how markets move.</LI>
        </UL>
      </Section>
    </ContentPage>
  );
}
