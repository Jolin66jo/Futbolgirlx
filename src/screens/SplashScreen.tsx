// Onboarding step 1 — splash screen with logo + Learn More / Skip.

import { ArrowRight, BookOpen } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Button } from '../components/ui';
import { LogoMark } from '../components/Logo';

export function SplashScreen() {
  const { navigate, completeOnboarding } = useApp();

  return (
    <div className="min-h-screen relative overflow-hidden bg-grad-brand text-white flex flex-col">
      {/* decorative blobs */}
      <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-40 -right-24 w-72 h-72 rounded-full bg-secondary-400/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse-ring" />
          <div className="relative bg-white/15 backdrop-blur-md rounded-3xl p-4 ring-1 ring-white/30">
            <LogoMark size={72} />
          </div>
        </div>
        <h1 className="mt-8 font-display font-extrabold text-5xl tracking-tight drop-shadow-sm">
          futbol<span className="text-white/90">girl</span><span className="text-secondary-200">x</span>
        </h1>
        <p className="mt-3 text-lg text-white/90 font-medium max-w-xs">
          Trade shares in women's football clubs.
        </p>
        <p className="mt-1 text-sm text-white/70 max-w-xs">
          Buy. Sell. Ride the scarcity.
        </p>
      </div>

      <div className="relative px-6 pb-10 safe-bottom space-y-3">
        <Button
          block size="lg" variant="secondary"
          rightIcon={<ArrowRight size={18} />}
          onClick={() => navigate('walkthrough')}
          className="bg-white text-primary-700 hover:bg-ink-50 shadow-card-lg"
        >
          Learn More
        </Button>
        <button
          onClick={() => { completeOnboarding(); navigate('landing'); }}
          className="tap tap-scale w-full h-11 inline-flex items-center justify-center gap-2 text-white/90 font-semibold hover:text-white"
        >
          <BookOpen size={16} /> Skip to home
        </button>
      </div>
    </div>
  );
}
