# Project Context: FutbolX

## 1. Core Concept & Elevator Pitch
**FutbolX** is a fantasy sports stock market web application built with **Vite**. It allows users to buy, sell, and trade virtual shares of real-world football (soccer) clubs within a league. 

* **Real Mechanics, Virtual Currency:** The trading engine, order execution, portfolio tracking, and market analytics must feel like a real, institutional-grade financial trading platform. However, **no real money is used**. Users are granted a starting balance of virtual currency ("paper money") upon signup to trade with.
* **Primary Engineering Focus:** Our core responsibility is accurately ingesting, processing, and displaying real-time/historical football data and market prices in a clean, responsive, and high-trust UI.

---

## 2. Core Product Rules & Constraints (For AI Code Generation)
When generating components, state management, database schemas, or API logic, strictly adhere to these rules:

1. **No Real-Money Payment Gateways:** Do NOT generate code for Stripe, PayPal, bank account linking (Plaid), KYC/AML identity verification, or real-world fiat withdrawals. All balances and transactions use internal virtual currency.
2. **Authentic Trading UX:** Despite using virtual money, avoid "toy-like" UI. Use standard financial terminology and components: *Market/Limit Orders, Bid/Ask Spreads, Portfolio Allocation, Unrealized P&L (Profit & Loss), Watchlists, and Candlestick/Line Price Charts.*
3. **Data-Driven Presentation:** Prioritize clean data visualization, fast state updates, and clear formatting (e.g., proper currency formatting, percentage badges with green/red indicators, responsive tables).
4. **Modular & Scalable Architecture:** Structure features cleanly so future engagement and monetization layers can be plugged in without refactoring the core trading engine.

---

## 3. Core Features (MVP Scope)
* **User Onboarding & Virtual Wallet:** Users receive a fixed starting virtual cash balance (e.g., $10,000 FXD) upon creating an account.
* **Club Market Pages:** Dedicated pages for each football club displaying live/simulated share price, historical price charts, club stats, recent match results, and upcoming fixtures.
* **Order Execution Engine:** Instant buy/sell execution at current market prices (with room to expand into limit orders), updating user cash balance and share holdings immediately.
* **User Profile & Portfolio:** Displays total net worth (cash + share value), active holdings, historical trade ledger, watchlist, and favorite club badge.
* **League Standings & Market Movers:** Dashboards highlighting top-gaining clubs, top-losing clubs, and highest trading volume.

---

## 4. Future Roadmap (Keep Architecture Extensible For)
Do not build these unless explicitly prompted, but ensure data models and UI layouts leave room for:
* **Engagement & Gamification:** Public leaderboards, trader ranks/badges, private friend leagues, and seasonal tournaments.
* **Revenue & Monetization:** Virtual currency top-up packs (in-app purchases), rewarded video ads for bonus funds, premium analytics subscriptions (Pro tier), and sponsored club insights.

---

## 5. Technical Stack & Coding Standards
* **Framework:** Vite (React / Vue / Svelte — *[Insert your specific framework & language, e.g., React + TypeScript]*)
* **Styling:** *[Insert styling tool, e.g., Tailwind CSS]*
* **State Management / Backend:** *[Insert tools, e.g., Zustand, TanStack Query, Supabase/Firebase]*
* **Design Philosophy:** Mobile-first, dark-mode friendly, data-dense yet scannable, inspired by modern fintech apps (e.g., Robinhood, Trading 212) combined with sports data platforms (e.g., FotMob, SofaScore).
