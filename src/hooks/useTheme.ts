import { useEffect } from 'react';
import type { RestaurantSettings } from '@/types';

export function useThemeColors(settings: RestaurantSettings | null) {
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    root.style.setProperty('--c-primary', settings.primary_color);
    root.style.setProperty('--c-secondary', settings.secondary_color);
    root.style.setProperty('--c-accent', settings.accent_color);
    root.style.setProperty('--c-neutral', settings.neutral_color);
    root.style.setProperty('--font-heading', `'${settings.heading_font}', serif`);
    root.style.setProperty('--font-body', `'${settings.body_font}', sans-serif`);
  }, [settings]);
}

export function getAppBackground(settings: RestaurantSettings | null): React.CSSProperties {
  if (!settings) return { background: '#1a1410' };
  if (settings.bg_type === 'image' && settings.bg_image_url) {
    return {
      backgroundImage: `linear-gradient(rgba(26,20,16,0.6), rgba(26,20,16,0.85)), url(${settings.bg_image_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  }
  if (settings.bg_type === 'gradient') {
    return { background: settings.bg_value };
  }
  return { background: settings.bg_value };
}
