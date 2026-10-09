import { useState, useEffect, lazy, Suspense } from 'react';
import { CartProvider } from '@/hooks/useCart';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { useThemeColors, getAppBackground } from '@/hooks/useTheme';
import { LandingScreen } from '@/components/LandingScreen';
import { MenuPage } from '@/components/MenuPage';
import { OrderDrawer } from '@/components/OrderDrawer';

const AdminPortal = lazy(() =>
  import('@/components/AdminPortal').then((m) => ({ default: m.AdminPortal }))
);

type Screen = 'landing' | 'menu' | 'admin';

function AppContent() {
  const { settings, sections, items, loading, error } = useRestaurantData();
  const [screen, setScreen] = useState<Screen>('landing');

  useThemeColors(settings);

  // Check URL hash for admin route
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setScreen('admin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const appStyle = getAppBackground(settings);

  if (screen === 'admin') {
    return (
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: 'var(--c-dark)' }}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }}
            />
          </div>
        }
      >
        <AdminPortal />
      </Suspense>
    );
  }

  if (screen === 'landing') {
    return (
      <div style={appStyle}>
        <LandingScreen
          settings={settings}
          loading={loading}
          onEnter={() => setScreen('menu')}
        />
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <MenuPage settings={settings} sections={sections} items={items} loading={loading} />
      <OrderDrawer settings={settings} />
      {error && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm animate-fade-in"
          style={{ background: 'var(--c-accent)', color: 'var(--c-neutral)' }}
        >
          Couldn&apos;t load menu data. Pull down to refresh.
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
