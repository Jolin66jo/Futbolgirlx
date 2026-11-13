// Mock data for the NWSL with real-world club info (stadium, capacity, address,
// founding year, attendance) sourced from public knowledge of each club.
// Numbers like prices/shares/standings are simulated for the demo.
//
// Also includes per-PLAYER tradable markets (Prompt 9-10) and analytics
// history (Prompt 12) for each club.

import type {
  Club, League, LeagueId, Player, PricePoint,
  ClubAnalytics, LeaguePositionPoint, SeasonValue, CoachTenure,
} from '../types';

export const LEAGUES: League[] = [
  { id: 'nwsl', name: 'National Women\u2019s Soccer League', shortName: 'NWSL', country: 'United States', countryCode: 'us', active: true, seasonStatus: 'live', blurb: 'The top flight of women\u2019s professional soccer in the United States.', accent: '#ec4899' },
  { id: 'wsl', name: 'Women\u2019s Super League', shortName: 'WSL', country: 'England', countryCode: 'gb', active: false, seasonStatus: 'live', blurb: 'England\u2019s top domestic women\u2019s division.', accent: '#0ea5e9' },
  { id: 'uwcl', name: 'UEFA Women\u2019s Champions League', shortName: 'UWCL', country: 'Europe', countryCode: 'eu', active: false, seasonStatus: 'live', blurb: 'The premier continental club competition in Europe.', accent: '#f43f5e' },
  { id: 'liga-mx-femenil', name: 'Liga MX Femenil', shortName: 'LIGA MX F', country: 'Mexico', countryCode: 'mx', active: false, seasonStatus: 'live', blurb: 'Mexico\u2019s top women\u2019s professional league.', accent: '#10b981' },
  { id: 'nwsl2', name: 'NWSL x Liga MX Summer Cup', shortName: 'SUMMER CUP', country: 'International', countryCode: 'us', active: false, seasonStatus: 'live', blurb: 'Cross-league summer showcase tournament.', accent: '#f59e0b' },
  { id: 'damallsvenskan', name: 'Damallsvenskan', shortName: 'DAMALLSV', country: 'Sweden', countryCode: 'se', active: false, seasonStatus: 'finished', blurb: 'Sweden\u2019s top women\u2019s division \u2014 one of the strongest leagues in Europe. 2024 season finished; prices seeded from final standings.', accent: '#0284c7' },
  { id: 'serie-a-fem', name: 'Serie A Femminile', shortName: 'SERIE A F', country: 'Italy', countryCode: 'it', active: false, seasonStatus: 'finished', blurb: 'Italy\u2019s top women\u2019s division. 2023-24 season finished; prices seeded from final standings.', accent: '#16a34a' },
  { id: 'liga-bpi', name: 'Liga BPI (Campeonato Nacional Feminino)', shortName: 'LIGA BPI', country: 'Portugal', countryCode: 'pt', active: false, seasonStatus: 'finished', blurb: 'Portugal\u2019s top women\u2019s division. 2023-24 season finished; prices seeded from final standings.', accent: '#dc2626' },
  { id: 'liga-f', name: 'Liga F', shortName: 'LIGA F', country: 'Spain', countryCode: 'es', active: false, seasonStatus: 'finished', blurb: 'Spain\u2019s top women\u2019s division, home of Barcelona & Real Madrid. 2023-24 season finished; prices seeded from final standings.', accent: '#f59e0b' },
  { id: 'usl-w', name: 'USL W League', shortName: 'USL W', country: 'United States', countryCode: 'us', active: false, seasonStatus: 'finished', blurb: 'USL\u2019s pre-professional women\u2019s league. Summer season; 2024 finished; prices seeded from final standings.', accent: '#db2777' },
  { id: 'nsl', name: 'Northern Super League', shortName: 'NSL', country: 'Canada', countryCode: 'ca', active: false, seasonStatus: 'finished', blurb: 'Canada\u2019s new top-tier women\u2019s pro league. Inaugural 2025 season; prices seeded from first standings.', accent: '#be185d' },
];

function makeHistory(seed: number, base: number, days = 30): PricePoint[] {
  const out: PricePoint[] = [];
  let p = base * 0.9;
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const r = Math.sin(seed * 12.9898 + (days - i) * 78.233) * 43758.5453;
    const frac = r - Math.floor(r);
    const drift = (frac - 0.5) * base * 0.06;
    p = Math.max(base * 0.5, p + drift + base * 0.004);
    out.push({ t: now - i * 24 * 3600 * 1000, p: Math.round(p * 100) / 100 });
  }
  out[out.length - 1].p = Math.round(base * (1 + ((Math.abs(Math.sin(seed)) * 10) - 4) / 100) * 100) / 100;
  return out;
}

// --- Real-world NWSL club info ----------------------------------------------
// stadium / capacity / address / foundedYear / avgAttendance are from public
// records (Wikipedia + club official sites). Standings/players simulated.

interface ClubSeed {
  id: string; name: string; short: string; abbr: string; city: string;
  c1: string; c2: string; base: number; pf: number; pa: number;
  w: number; d: number; l: number; perf: number; buzz: number; avail: number;
  stadium: string; cap: number; address: string; founded: number; att: number;
  players: { name: string; pos: string; n: number; r: number; age: number; nat: string; goals: number; ast: number; mins: number; apps: number; pBase: number; pAvail: number; pPerf: number; pBuzz: number }[];
  fixtures: { opp: string; abbr: string; home: boolean; comp: string; days: number }[];
}

const seeds: ClubSeed[] = [
  {
    id: 'bay', name: 'Bay FC', short: 'Bay FC', abbr: 'BAY', city: 'San Jose, CA',
    c1: '#0ea5e9', c2: '#1e293b', base: 64, pf: 28, pa: 22, w: 9, d: 4, l: 5, perf: 0.58, buzz: 71, avail: 620,
    stadium: 'PayPal Park', cap: 18000, address: '1123 Coleman Ave, San Jose, CA 95110', founded: 2023, att: 14200,
    players: [
      { name: 'Racheal Kundananji', pos: 'FW', n: 9, r: 7.4, age: 24, nat: 'Zambia', goals: 8, ast: 3, mins: 1620, apps: 20, pBase: 42, pAvail: 710, pPerf: 0.62, pBuzz: 78 },
      { name: 'Asisat Oshoala', pos: 'FW', n: 8, r: 7.1, age: 29, nat: 'Nigeria', goals: 6, ast: 2, mins: 1340, apps: 18, pBase: 38, pAvail: 680, pPerf: 0.55, pBuzz: 74 },
      { name: 'Alex Loera', pos: 'MF', n: 6, r: 6.9, age: 25, nat: 'United States', goals: 2, ast: 4, mins: 1480, apps: 21, pBase: 22, pAvail: 820, pPerf: 0.45, pBuzz: 52 },
    ],
    fixtures: [{ opp: 'San Diego Wave', abbr: 'SD', home: true, comp: 'NWSL', days: 4 }, { opp: 'Angel City FC', abbr: 'AC', home: false, comp: 'NWSL', days: 11 }, { opp: 'Seattle Reign', abbr: 'SEA', home: true, comp: 'NWSL', days: 18 }],
  },
  {
    id: 'por', name: 'Portland Thorns', short: 'Thorns', abbr: 'POR', city: 'Portland, OR',
    c1: '#e11d48', c2: '#1e293b', base: 88, pf: 36, pa: 19, w: 12, d: 3, l: 3, perf: 0.82, buzz: 92, avail: 280,
    stadium: 'Providence Park', cap: 25218, address: '1844 SW Morrison St, Portland, OR 97205', founded: 2012, att: 20500,
    players: [
      { name: 'Sophia Smith', pos: 'FW', n: 11, r: 8.3, age: 24, nat: 'United States', goals: 12, ast: 5, mins: 1780, apps: 22, pBase: 78, pAvail: 240, pPerf: 0.85, pBuzz: 94 },
      { name: 'Christine Sinclair', pos: 'FW', n: 12, r: 7.8, age: 41, nat: 'Canada', goals: 7, ast: 4, mins: 1450, apps: 20, pBase: 58, pAvail: 360, pPerf: 0.7, pBuzz: 88 },
      { name: 'Sam Coffey', pos: 'MF', n: 17, r: 7.5, age: 25, nat: 'United States', goals: 3, ast: 6, mins: 1820, apps: 23, pBase: 40, pAvail: 540, pPerf: 0.6, pBuzz: 66 },
    ],
    fixtures: [{ opp: 'Seattle Reign', abbr: 'SEA', home: true, comp: 'NWSL', days: 3 }, { opp: 'Kansas City Current', abbr: 'KC', home: false, comp: 'NWSL', days: 10 }, { opp: 'Gotham FC', abbr: 'GTH', home: true, comp: 'NWSL', days: 17 }],
  },
  {
    id: 'kc', name: 'Kansas City Current', short: 'Current', abbr: 'KC', city: 'Kansas City, MO',
    c1: '#0ea5e9', c2: '#ec4899', base: 76, pf: 33, pa: 21, w: 11, d: 4, l: 3, perf: 0.74, buzz: 84, avail: 410,
    stadium: 'CPKC Stadium', cap: 11500, address: '1810 France Family Dr, Kansas City, MO 64108', founded: 2020, att: 11200,
    players: [
      { name: 'Temwa Chawinga', pos: 'FW', n: 7, r: 8.1, age: 26, nat: 'Malawi', goals: 18, ast: 4, mins: 1860, apps: 23, pBase: 72, pAvail: 310, pPerf: 0.88, pBuzz: 90 },
      { name: 'Vanessa DiBernardo', pos: 'MF', n: 21, r: 7.6, age: 33, nat: 'United States', goals: 4, ast: 7, mins: 1600, apps: 21, pBase: 38, pAvail: 580, pPerf: 0.58, pBuzz: 60 },
      { name: 'Lo\u00edas Labont\u00e9', pos: 'GK', n: 1, r: 7.2, age: 28, nat: 'Brazil', goals: 0, ast: 0, mins: 1980, apps: 22, pBase: 28, pAvail: 720, pPerf: 0.5, pBuzz: 48 },
    ],
    fixtures: [{ opp: 'Racing Louisville', abbr: 'LOU', home: true, comp: 'NWSL', days: 5 }, { opp: 'Portland Thorns', abbr: 'POR', home: true, comp: 'NWSL', days: 10 }, { opp: 'North Carolina Courage', abbr: 'NC', home: false, comp: 'NWSL', days: 16 }],
  },
  {
    id: 'gth', name: 'Gotham FC', short: 'Gotham', abbr: 'GTH', city: 'Harrison, NJ',
    c1: '#0f172a', c2: '#ec4899', base: 72, pf: 30, pa: 23, w: 10, d: 4, l: 4, perf: 0.66, buzz: 79, avail: 540,
    stadium: 'Sports Illustrated Stadium', cap: 25000, address: '50 Route 120, Harrison, NJ 07029', founded: 2006, att: 9800,
    players: [
      { name: 'Esther Gonz\u00e1lez', pos: 'FW', n: 9, r: 7.9, age: 28, nat: 'Spain', goals: 9, ast: 3, mins: 1700, apps: 21, pBase: 56, pAvail: 420, pPerf: 0.72, pBuzz: 82 },
      { name: 'Lynn Williams', pos: 'FW', n: 14, r: 7.4, age: 31, nat: 'United States', goals: 7, ast: 5, mins: 1580, apps: 20, pBase: 44, pAvail: 560, pPerf: 0.62, pBuzz: 70 },
      { name: 'Tierna Davidson', pos: 'DF', n: 4, r: 7.3, age: 25, nat: 'United States', goals: 1, ast: 2, mins: 1820, apps: 22, pBase: 32, pAvail: 680, pPerf: 0.55, pBuzz: 58 },
    ],
    fixtures: [{ opp: 'Washington Spirit', abbr: 'WAS', home: false, comp: 'NWSL', days: 4 }, { opp: 'Orlando Pride', abbr: 'ORL', home: true, comp: 'NWSL', days: 12 }, { opp: 'Portland Thorns', abbr: 'POR', home: false, comp: 'NWSL', days: 17 }],
  },
  {
    id: 'orl', name: 'Orlando Pride', short: 'Pride', abbr: 'ORL', city: 'Orlando, FL',
    c1: '#f43f5e', c2: '#7c3aed', base: 70, pf: 31, pa: 20, w: 11, d: 3, l: 4, perf: 0.72, buzz: 76, avail: 480,
    stadium: 'Inter&Co Stadium', cap: 25000, address: 'W Pine St, Orlando, FL 32801', founded: 2015, att: 9200,
    players: [
      { name: 'Barbra Banda', pos: 'FW', n: 10, r: 8.4, age: 24, nat: 'Zambia', goals: 13, ast: 4, mins: 1800, apps: 22, pBase: 68, pAvail: 340, pPerf: 0.84, pBuzz: 89 },
      { name: 'Marta', pos: 'MF', n: 9, r: 7.7, age: 38, nat: 'Brazil', goals: 5, ast: 6, mins: 1500, apps: 19, pBase: 54, pAvail: 460, pPerf: 0.66, pBuzz: 80 },
      { name: 'Emily Madril', pos: 'DF', n: 3, r: 7.0, age: 26, nat: 'United States', goals: 0, ast: 1, mins: 1750, apps: 21, pBase: 26, pAvail: 740, pPerf: 0.5, pBuzz: 44 },
    ],
    fixtures: [{ opp: 'Racing Louisville', abbr: 'LOU', home: false, comp: 'NWSL', days: 3 }, { opp: 'Gotham FC', abbr: 'GTH', home: false, comp: 'NWSL', days: 12 }, { opp: 'Bay FC', abbr: 'BAY', home: true, comp: 'NWSL', days: 19 }],
  },
  {
    id: 'nc', name: 'North Carolina Courage', short: 'Courage', abbr: 'NC', city: 'Cary, NC',
    c1: '#0ea5e9', c2: '#f59e0b', base: 58, pf: 24, pa: 25, w: 7, d: 5, l: 6, perf: 0.48, buzz: 61, avail: 700,
    stadium: 'WakeMed Soccer Park', cap: 10000, address: '101 Soccer Park Dr, Cary, NC 27511', founded: 2017, att: 5400,
    players: [
      { name: 'Jaedyn Shaw', pos: 'FW', n: 8, r: 7.3, age: 19, nat: 'United States', goals: 6, ast: 3, mins: 1450, apps: 19, pBase: 40, pAvail: 560, pPerf: 0.6, pBuzz: 72 },
      { name: 'Debinha', pos: 'MF', n: 10, r: 7.5, age: 32, nat: 'Brazil', goals: 5, ast: 6, mins: 1600, apps: 20, pBase: 44, pAvail: 520, pPerf: 0.64, pBuzz: 68 },
      { name: 'Casey Murphy', pos: 'GK', n: 1, r: 7.1, age: 28, nat: 'United States', goals: 0, ast: 0, mins: 1890, apps: 21, pBase: 26, pAvail: 760, pPerf: 0.52, pBuzz: 46 },
    ],
    fixtures: [{ opp: 'Chicago Red Stars', abbr: 'CHI', home: true, comp: 'NWSL', days: 6 }, { opp: 'Kansas City Current', abbr: 'KC', home: true, comp: 'NWSL', days: 16 }, { opp: 'San Diego Wave', abbr: 'SD', home: false, comp: 'NWSL', days: 22 }],
  },
  {
    id: 'sd', name: 'San Diego Wave', short: 'Wave', abbr: 'SD', city: 'San Diego, CA',
    c1: '#0ea5e9', c2: '#f43f5e', base: 62, pf: 26, pa: 24, w: 8, d: 4, l: 6, perf: 0.52, buzz: 66, avail: 650,
    stadium: 'Snapdragon Stadium', cap: 35000, address: '9449 Friars Rd, San Diego, CA 92108', founded: 2021, att: 13600,
    players: [
      { name: 'Alex Morgan', pos: 'FW', n: 13, r: 7.2, age: 35, nat: 'United States', goals: 7, ast: 3, mins: 1380, apps: 18, pBase: 50, pAvail: 480, pPerf: 0.6, pBuzz: 82 },
      { name: 'Savannah McCaskill', pos: 'MF', n: 7, r: 6.9, age: 28, nat: 'United States', goals: 3, ast: 5, mins: 1550, apps: 20, pBase: 28, pAvail: 700, pPerf: 0.5, pBuzz: 50 },
      { name: 'Naomi Girma', pos: 'DF', n: 4, r: 7.6, age: 24, nat: 'United States', goals: 0, ast: 2, mins: 1800, apps: 22, pBase: 46, pAvail: 420, pPerf: 0.68, pBuzz: 76 },
    ],
    fixtures: [{ opp: 'Bay FC', abbr: 'BAY', home: false, comp: 'NWSL', days: 4 }, { opp: 'Seattle Reign', abbr: 'SEA', home: true, comp: 'NWSL', days: 13 }, { opp: 'North Carolina Courage', abbr: 'NC', home: true, comp: 'NWSL', days: 22 }],
  },
  {
    id: 'lou', name: 'Racing Louisville', short: 'Racing', abbr: 'LOU', city: 'Louisville, KY',
    c1: '#be123c', c2: '#f59e0b', base: 48, pf: 20, pa: 28, w: 5, d: 5, l: 8, perf: 0.34, buzz: 48, avail: 820,
    stadium: 'Lynn Family Stadium', cap: 11500, address: '360 Abe Batchelder Dr, Louisville, KY 40202', founded: 2019, att: 6900,
    players: [
      { name: 'Uchenna Kanu', pos: 'FW', n: 9, r: 6.8, age: 26, nat: 'Nigeria', goals: 5, ast: 2, mins: 1300, apps: 17, pBase: 24, pAvail: 780, pPerf: 0.48, pBuzz: 52 },
      { name: 'Savannah DeMelo', pos: 'MF', n: 8, r: 7.1, age: 26, nat: 'United States', goals: 4, ast: 5, mins: 1620, apps: 21, pBase: 34, pAvail: 640, pPerf: 0.56, pBuzz: 62 },
      { name: 'Jordyn Bloomer', pos: 'GK', n: 1, r: 6.6, age: 27, nat: 'United States', goals: 0, ast: 0, mins: 1710, apps: 19, pBase: 20, pAvail: 840, pPerf: 0.42, pBuzz: 40 },
    ],
    fixtures: [{ opp: 'Orlando Pride', abbr: 'ORL', home: true, comp: 'NWSL', days: 3 }, { opp: 'Kansas City Current', abbr: 'KC', home: false, comp: 'NWSL', days: 5 }, { opp: 'Houston Dash', abbr: 'HOU', home: true, comp: 'NWSL', days: 20 }],
  },
  {
    id: 'sea', name: 'Seattle Reign', short: 'Reign', abbr: 'SEA', city: 'Seattle, WA',
    c1: '#0c4a6e', c2: '#0ea5e9', base: 54, pf: 22, pa: 24, w: 6, d: 6, l: 6, perf: 0.42, buzz: 55, avail: 760,
    stadium: 'Lumen Field', cap: 68740, address: '800 Occidental Ave S, Seattle, WA 98134', founded: 2012, att: 13200,
    players: [
      { name: 'Ji So-Yun', pos: 'MF', n: 10, r: 7.2, age: 33, nat: 'South Korea', goals: 4, ast: 6, mins: 1580, apps: 20, pBase: 40, pAvail: 560, pPerf: 0.6, pBuzz: 64 },
      { name: 'Bethany Balcer', pos: 'FW', n: 6, r: 6.9, age: 28, nat: 'United States', goals: 6, ast: 2, mins: 1450, apps: 19, pBase: 32, pAvail: 660, pPerf: 0.54, pBuzz: 56 },
      { name: 'Lauren Barnes', pos: 'DF', n: 3, r: 6.8, age: 35, nat: 'United States', goals: 0, ast: 3, mins: 1680, apps: 21, pBase: 22, pAvail: 800, pPerf: 0.46, pBuzz: 44 },
    ],
    fixtures: [{ opp: 'Portland Thorns', abbr: 'POR', home: false, comp: 'NWSL', days: 3 }, { opp: 'Bay FC', abbr: 'BAY', home: false, comp: 'NWSL', days: 18 }, { opp: 'San Diego Wave', abbr: 'SD', home: false, comp: 'NWSL', days: 13 }],
  },
  {
    id: 'ac', name: 'Angel City FC', short: 'Angel City', abbr: 'AC', city: 'Los Angeles, CA',
    c1: '#ec4899', c2: '#0f172a', base: 56, pf: 23, pa: 25, w: 6, d: 5, l: 7, perf: 0.4, buzz: 68, avail: 730,
    stadium: 'BMO Stadium', cap: 22000, address: '3939 S Figueroa St, Los Angeles, CA 90037', founded: 2020, att: 16600,
    players: [
      { name: 'Christen Press', pos: 'FW', n: 23, r: 7.0, age: 35, nat: 'United States', goals: 4, ast: 2, mins: 1100, apps: 14, pBase: 46, pAvail: 520, pPerf: 0.56, pBuzz: 80 },
      { name: 'Sydney Leroux', pos: 'FW', n: 2, r: 6.8, age: 34, nat: 'United States', goals: 3, ast: 1, mins: 980, apps: 16, pBase: 30, pAvail: 700, pPerf: 0.46, pBuzz: 58 },
      { name: 'Ali Riley', pos: 'DF', n: 5, r: 6.7, age: 37, nat: 'New Zealand', goals: 0, ast: 2, mins: 1500, apps: 20, pBase: 22, pAvail: 820, pPerf: 0.44, pBuzz: 48 },
    ],
    fixtures: [{ opp: 'Houston Dash', abbr: 'HOU', home: true, comp: 'NWSL', days: 5 }, { opp: 'Bay FC', abbr: 'BAY', home: true, comp: 'NWSL', days: 11 }, { opp: 'Gotham FC', abbr: 'GTH', home: false, comp: 'NWSL', days: 23 }],
  },
  {
    id: 'was', name: 'Washington Spirit', short: 'Spirit', abbr: 'WAS', city: 'Washington, DC',
    c1: '#be185d', c2: '#0ea5e9', base: 60, pf: 25, pa: 22, w: 8, d: 4, l: 6, perf: 0.54, buzz: 63, avail: 670,
    stadium: 'Audi Field', cap: 20000, address: '100 Potomac Ave SW, Washington, DC 20024', founded: 2012, att: 9100,
    players: [
      { name: 'Tara McKeown', pos: 'FW', n: 11, r: 7.0, age: 23, nat: 'United States', goals: 5, ast: 3, mins: 1500, apps: 20, pBase: 36, pAvail: 600, pPerf: 0.58, pBuzz: 62 },
      { name: 'Andi Sullivan', pos: 'MF', n: 8, r: 7.1, age: 28, nat: 'United States', goals: 2, ast: 4, mins: 1680, apps: 22, pBase: 38, pAvail: 580, pPerf: 0.6, pBuzz: 64 },
      { name: 'Aubrey Kingsbury', pos: 'GK', n: 1, r: 7.3, age: 33, nat: 'United States', goals: 0, ast: 0, mins: 1920, apps: 22, pBase: 28, pAvail: 740, pPerf: 0.54, pBuzz: 52 },
    ],
    fixtures: [{ opp: 'Gotham FC', abbr: 'GTH', home: true, comp: 'NWSL', days: 4 }, { opp: 'Chicago Red Stars', abbr: 'CHI', home: false, comp: 'NWSL', days: 14 }, { opp: 'North Carolina Courage', abbr: 'NC', home: true, comp: 'NWSL', days: 21 }],
  },
  {
    id: 'chi', name: 'Chicago Red Stars', short: 'Red Stars', abbr: 'CHI', city: 'Chicago, IL',
    c1: '#0ea5e9', c2: '#e11d48', base: 50, pf: 21, pa: 27, w: 5, d: 6, l: 7, perf: 0.36, buzz: 52, avail: 790,
    stadium: 'SeatGeek Stadium', cap: 28000, address: '7000 S Harlem Ave, Bridgeview, IL 60455', founded: 2007, att: 5700,
    players: [
      { name: 'Mallory Swanson', pos: 'FW', n: 9, r: 7.4, age: 26, nat: 'United States', goals: 8, ast: 3, mins: 1560, apps: 20, pBase: 52, pAvail: 480, pPerf: 0.66, pBuzz: 78 },
      { name: 'Ariel LeSota', pos: 'MF', n: 5, r: 6.7, age: 24, nat: 'United States', goals: 1, ast: 3, mins: 1300, apps: 18, pBase: 24, pAvail: 800, pPerf: 0.44, pBuzz: 46 },
      { name: 'Alyssa Naeher', pos: 'GK', n: 1, r: 7.5, age: 36, nat: 'United States', goals: 0, ast: 0, mins: 1860, apps: 21, pBase: 34, pAvail: 680, pPerf: 0.58, pBuzz: 60 },
    ],
    fixtures: [{ opp: 'North Carolina Courage', abbr: 'NC', home: false, comp: 'NWSL', days: 6 }, { opp: 'Washington Spirit', abbr: 'WAS', home: true, comp: 'NWSL', days: 14 }, { opp: 'Houston Dash', abbr: 'HOU', home: false, comp: 'NWSL', days: 24 }],
  },
];

function makeClub(s: ClubSeed, idx: number): Club {
  const played = s.w + s.d + s.l;
  const points = s.w * 3 + s.d;
  const history = makeHistory(idx + 1, s.base);
  return {
    kind: 'club',
    id: s.id, leagueId: 'nwsl', name: s.name, shortName: s.short, abbr: s.abbr, city: s.city,
    brandColor: s.c1, brandColor2: s.c2,
    basePrice: s.base, totalShares: 1000, sharesAvailable: s.avail, performanceScore: s.perf,
    priceHistory: history, buzz: s.buzz,
    stadium: s.stadium, stadiumCapacity: s.cap, stadiumAddress: s.address,
    foundedYear: s.founded, avgAttendance: s.att,
    played, wins: s.w, draws: s.d, losses: s.l, goalsFor: s.pf, goalsAgainst: s.pa, points,
    keyPlayers: s.players.map((p, i) => ({ id: `${s.id}-p${i}`, name: p.name, position: p.pos, number: p.n, rating: p.r })),
    fixtures: s.fixtures.map((f, i) => ({
      id: `${s.id}-f${i}`, opponent: f.opp, opponentAbbr: f.abbr, home: f.home,
      competition: f.comp, date: new Date(Date.now() + f.days * 24 * 3600 * 1000).toISOString(),
    })),
  };
}

function makePlayer(club: Club, ps: ClubSeed['players'][number], i: number): Player {
  const pid = `${club.id}-p${i}`;
  const history = makeHistory((i + 1) * 7 + 3, ps.pBase);
  return {
    kind: 'player',
    id: pid, clubId: club.id,
    name: ps.name, shortName: ps.name.split(' ').slice(-1)[0], abbr: ps.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    brandColor: club.brandColor, brandColor2: club.brandColor2,
    basePrice: ps.pBase, totalShares: 1000, sharesAvailable: ps.pAvail, performanceScore: ps.pPerf,
    priceHistory: history, buzz: ps.pBuzz,
    position: ps.pos, number: ps.n, age: ps.age, nationality: ps.nat,
    season: '2024-25',
    goals: ps.goals, assists: ps.ast, minutes: ps.mins, appearances: ps.apps,
  };
}

// --- Analytics (5-year simulated history) -----------------------------------

function makeAnalytics(club: Club, seedIdx: number): ClubAnalytics {
  const rng = (n: number) => { const r = Math.sin(seedIdx * 11.7 + n * 3.3) * 43758.5453; return r - Math.floor(r); };
  const years = [2020, 2021, 2022, 2023, 2024];
  const teams = 12;

  const leaguePositions: LeaguePositionPoint[] = years.map((y, i) => {
    const base = 1 + Math.floor(rng(i + 1) * teams);
    return { season: y, position: Math.min(teams, Math.max(1, base + (i > 2 ? -1 : 1))) };
  });

  const squadValueTrend: SeasonValue[] = years.map((y, i) => ({
    season: y,
    value: Math.round((club.basePrice * (0.6 + rng(i + 5) * 0.8)) * 100) / 100,
  }));

  const playerTurnover: SeasonValue[] = years.map((y, i) => ({
    season: y,
    value: Math.round(15 + rng(i + 9) * 35), // 15-50%
  }));

  const attendanceTrend: SeasonValue[] = years.map((y, i) => ({
    season: y,
    value: Math.round(club.avgAttendance * (0.6 + rng(i + 13) * 0.6)),
  }));

  const coachNames = ['Emma Hayes', 'Laura Harvey', 'Casey Stoney', 'Mark Parsons'];
  const coachTenure: CoachTenure[] = [
    { id: `${club.id}-c0`, coach: coachNames[seedIdx % coachNames.length], startSeason: 2020, endSeason: 2022 },
    { id: `${club.id}-c1`, coach: coachNames[(seedIdx + 1) % coachNames.length], startSeason: 2022, endSeason: 2023 },
    { id: `${club.id}-c2`, coach: coachNames[(seedIdx + 2) % coachNames.length], startSeason: 2023, endSeason: null },
  ];

  return { leaguePositions, squadValueTrend, playerTurnover, attendanceTrend, coachTenure };
}

export const MOCK_CLUBS: Club[] = seeds.map(makeClub);
export const MOCK_CLUBS_BY_ID: Record<string, Club> = Object.fromEntries(MOCK_CLUBS.map((c) => [c.id, c]));

export const MOCK_PLAYERS: Player[] = MOCK_CLUBS.flatMap((club, idx) =>
  seeds[idx].players.map((ps, i) => makePlayer(club, ps, i)),
);
export const MOCK_PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(MOCK_PLAYERS.map((p) => [p.id, p]));
export function mockPlayersForClub(clubId: string): Player[] {
  return MOCK_PLAYERS.filter((p) => p.clubId === clubId);
}

export const MOCK_ANALYTICS: Record<string, ClubAnalytics> = Object.fromEntries(
  MOCK_CLUBS.map((c, i) => [c.id, makeAnalytics(c, i)]),
);

export function mockClubsForLeague(leagueId: LeagueId): Club[] {
  return MOCK_CLUBS.filter((c) => c.leagueId === leagueId);
}
