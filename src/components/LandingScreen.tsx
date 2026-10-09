import { useEffect, useState, useRef } from 'react';
import { Wifi, ChefHat } from 'lucide-react';
import type { RestaurantSettings } from '@/types';

interface Props {
  settings: RestaurantSettings | null;
  onEnter: () => void;
  loading: boolean;
}

export function LandingScreen({ settings, onEnter, loading }: Props) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) return;
    setReady(true);
  }, [loading]);

  const startConnection = () => {
    setError(false);
    setProgress(0);
    const startTime = Date.now();
    const duration = 2000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => onEnter(), 300);
      }
    };
    timerRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  const handleTap = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    if (!ready) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    startConnection();
  };

  const name = settings?.name ?? 'Safari Fresh Chicken Charcoal & Fish Grill';
  const tagline = settings?.tagline ?? 'Grill, South Indian, North Indian, Indo-Chinese';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: settings?.hero_image_url
          ? `linear-gradient(rgba(26,20,16,0.55), rgba(26,20,16,0.85)), url(${settings.hero_image_url})`
          : 'linear-gradient(160deg, #1a1410 0%, #2d2018 50%, #1a1410 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Logo / brand */}
      <div className="flex flex-col items-center mb-12 animate-fade-in-up">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <ChefHat size={36} color="var(--c-neutral)" strokeWidth={1.5} />
          )}
        </div>
        <h1
          className="text-3xl font-bold text-center"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--c-neutral)',
            letterSpacing: '0.02em',
          }}
        >
          {name}
        </h1>
        <p
          className="text-sm tracking-widest uppercase mt-1.5"
          style={{ color: 'var(--c-secondary)', opacity: 0.8 }}
        >
          {tagline}
        </p>
      </div>

      {/* NFC Tap zone */}
      <div className="relative flex flex-col items-center">
        {/* Pulse rings */}
        <div className="absolute -z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-32 h-32 rounded-full border-2"
            style={{
              borderColor: 'var(--c-primary)',
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-full border-2"
            style={{
              borderColor: 'var(--c-primary)',
              animation: 'pulse-ring 2s ease-out infinite 0.5s',
            }}
          />
        </div>

        {/* Tap button */}
        <button
          onClick={handleTap}
          disabled={progress > 0 && progress < 100}
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-transform ${
            error ? 'animate-shake' : ''
          } ${progress === 0 ? 'animate-pulse-tap' : ''}`}
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: `2px solid var(--c-primary)`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
          aria-label="Tap to view menu"
        >
          <Wifi
            size={28}
            color="var(--c-primary)"
            strokeWidth={1.5}
            style={{ marginBottom: 4 }}
          />
          <span
            className="text-[10px] font-medium tracking-widest uppercase"
            style={{ color: 'var(--c-neutral)' }}
          >
            Tap to View
          </span>
        </button>

        {/* Progress bar */}
        {progress > 0 && progress < 100 && (
          <div className="mt-8 w-48 animate-fade-in">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, var(--c-primary), var(--c-secondary))`,
                }}
              />
            </div>
            <p
              className="text-center text-xs mt-2 tracking-wider"
              style={{ color: 'var(--c-secondary)', opacity: 0.7 }}
            >
              Connecting…
            </p>
          </div>
        )}

        {/* Error text */}
        {error && (
          <p
            className="mt-4 text-sm animate-fade-in"
            style={{ color: 'var(--c-accent)' }}
          >
            Couldn&apos;t read the tag. Please try again.
          </p>
        )}
      </div>

      {/* Footer hint */}
      <p
        className="absolute bottom-8 text-[11px] tracking-wider opacity-40"
        style={{ color: 'var(--c-neutral)' }}
      >
        Tap your phone to the NFC card on the table
      </p>
    </div>
  );
}
