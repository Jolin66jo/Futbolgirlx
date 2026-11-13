// About (Section 5 of the spec).

import { Shield, Sparkles, Users } from 'lucide-react';
import { ContentPage, Section, P, UL, LI } from './ContentPage';
import { LogoMark } from '../components/Logo';

export function AboutScreen() {
  return (
    <ContentPage title="About" subtitle="What futbolgirlx is">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-grad-brand-soft border border-primary-200/50 dark:border-primary-800/40">
        <LogoMark size={44} />
        <div>
          <p className="font-display font-extrabold text-lg">
            <span className="text-gradient">futbol</span><span className="text-ink-900 dark:text-white">girl</span><span className="text-secondary-500">x</span>
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400">Trade shares in women's football clubs.</p>
        </div>
      </div>

      <Section>
        <P>
          <strong>futbolgirlx</strong> is a market-style app that lets you buy and sell virtual "shares" in women's football clubs \u2014 starting with the NWSL. We turn the things fans already argue about \u2014 who's hot, who's struggling, who's got the loudest fan base \u2014 into a live, tradable market.
        </P>
        <P>
          It's a game, not a brokerage account. You start with a virtual cash balance, you build a portfolio of clubs you believe in, and you watch their prices move with results, buzz, and scarcity. No real money changes hands.
        </P>
      </Section>

      <Section title="Why we built it">
        <P>
          Women's football is one of the fastest-growing sports on the planet, and its fans are deeply engaged \u2014 but there's no fun, accessible way to "put your money where your mouth is" without real financial risk. futbolgirlx fills that gap.
        </P>
      </Section>

      <Section title="What makes it different">
        <UL>
          <LI><Sparkles size={15} className="inline mr-1.5 text-primary-500" />Prices move on <strong>performance + fan buzz + scarcity</strong>, not just wins and losses.</LI>
          <LI><Users size={15} className="inline mr-1.5 text-secondary-500" />Limited shares per club mean buying moves the price \u2014 you're trading against other fans' demand.</LI>
          <LI><Shield size={15} className="inline mr-1.5 text-success-500" />100% virtual. No real money, no wallet, no risk \u2014 just the thrill of the market.</LI>
        </UL>
      </Section>

      <Section title="What's next">
        <P>
          We're starting with the NWSL and expanding to more leagues soon \u2014 the WSL, UWCL, Liga MX Femenil, and cross-league tournaments. Same model, more clubs to trade.
        </P>
      </Section>
    </ContentPage>
  );
}
