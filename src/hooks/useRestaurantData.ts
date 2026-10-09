import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import type { RestaurantSettings, MenuSection, MenuItem } from '@/types';

export function useRestaurantData() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, sectionsRes, itemsRes] = await Promise.all([
        supabase.from('restaurant_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('menu_sections').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (sectionsRes.error) throw sectionsRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setSettings(settingsRes.data as RestaurantSettings | null);
      setSections((sectionsRes.data as MenuSection[]) ?? []);
      setItems((itemsRes.data as MenuItem[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { settings, sections, items, loading, error, refetch: fetchAll };
}
