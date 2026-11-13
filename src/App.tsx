import { AppProvider, useApp } from './state/AppContext';
import { BottomNav } from './components/BottomNav';
import { Toaster } from './components/Toaster';
import { SplashScreen } from './screens/SplashScreen';
import { WalkthroughScreen } from './screens/WalkthroughScreen';
import { ChooseLeagueScreen } from './screens/ChooseLeagueScreen';
import { LandingScreen } from './screens/LandingScreen';
import { LeagueHomeScreen } from './screens/LeagueHomeScreen';
import { ClubDetailScreen } from './screens/ClubDetailScreen';
import { PlayerProfileScreen } from './screens/PlayerProfileScreen';
import { CompareScreen } from './screens/CompareScreen';
import { PortfolioScreen } from './screens/PortfolioScreen';
import { AboutScreen } from './screens/AboutScreen';
import { HowToUseScreen } from './screens/HowToUseScreen';
import { DisclaimerScreen } from './screens/DisclaimerScreen';

function Router() {
  const { screen } = useApp();

  switch (screen) {
    case 'splash': return <SplashScreen />;
    case 'walkthrough': return <WalkthroughScreen />;
    case 'choose-league': return <ChooseLeagueScreen />;
    case 'landing': return <LandingScreen />;
    case 'league-home': return <LeagueHomeScreen />;
    case 'club-detail': return <ClubDetailScreen />;
    case 'player-profile': return <PlayerProfileScreen />;
    case 'compare': return <CompareScreen />;
    case 'portfolio': return <PortfolioScreen />;
    case 'about': return <AboutScreen />;
    case 'how-to-use': return <HowToUseScreen />;
    case 'disclaimer': return <DisclaimerScreen />;
    default: return <LeagueHomeScreen />;
  }
}

function Chrome() {
  const { screen } = useApp();
  const chromeless = screen === 'splash' || screen === 'walkthrough' || screen === 'choose-league';
  return (
    <>
      <Router />
      {!chromeless && <BottomNav />}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Chrome />
    </AppProvider>
  );
}
