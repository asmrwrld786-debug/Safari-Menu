import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Phone, UtensilsCrossed, X, Salad, Beef, Cake, Wine,
  Coffee, IceCream, Fish, Croissant, Soup, Pizza, Candy,
  Apple, Cherry, Citrus, GlassWater, Martini, CupSoda,
  type LucideIcon,
} from 'lucide-react';
import type { RestaurantSettings, MenuSection, MenuItem } from '@/types';
import { MenuItemCard } from './MenuItemCard';
import { useCart } from '@/hooks/useCart';

interface Props {
  settings: RestaurantSettings | null;
  sections: MenuSection[];
  items: MenuItem[];
  loading: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Salad, Beef, Cake, Wine, Coffee, IceCream, Fish, Croissant,
  Soup, Pizza, Candy, Apple, Cherry, Citrus, GlassWater,
  Martini, CupSoda, UtensilsCrossed,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] || UtensilsCrossed;
}

export function MenuPage({ settings, sections, items, loading }: Props) {
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { totalItems, setCartOpen } = useCart();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const itemsBySection = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const section of sections) {
      map.set(
        section.id,
        items.filter((i) => i.section_id === section.id).sort((a, b) => a.sort_order - b.sort_order)
      );
    }
    return map;
  }, [sections, items]);

  const activeSectionId = sections[activeSection]?.id;
  const activeItems = activeSectionId ? itemsBySection.get(activeSectionId) ?? [] : [];

  // Auto-scroll active tab into view
  useEffect(() => {
    const tab = tabRefs.current[activeSection];
    if (tab && tabsScrollRef.current) {
      const container = tabsScrollRef.current;
      const tabLeft = tab.offsetLeft;
      const tabRight = tabLeft + tab.offsetWidth;
      const viewLeft = container.scrollLeft;
      const viewRight = viewLeft + container.clientWidth;
      if (tabLeft < viewLeft) {
        container.scrollTo({ left: tabLeft - 16, behavior: 'smooth' });
      } else if (tabRight > viewRight) {
        container.scrollTo({ left: tabRight - container.clientWidth + 16, behavior: 'smooth' });
      }
    }
  }, [activeSection]);

  const name = settings?.name ?? 'Safari Fresh Chicken Charcoal & Fish Grill';

  return (
    <div className="min-h-screen pb-32" style={{ minHeight: '100dvh' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 pt-safe"
        style={{
          background: 'rgba(26,20,16,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))`,
              }}
            >
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <UtensilsCrossed size={18} color="var(--c-neutral)" strokeWidth={1.5} />
              )}
            </div>
            <span
              className="font-semibold text-base truncate"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}
            >
              {name}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setContactOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-label="Contact and reserve"
            >
              <Phone size={17} color="var(--c-neutral)" strokeWidth={1.8} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-label="View order"
            >
              <ShoppingBag size={17} color="var(--c-neutral)" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
                  style={{ background: 'var(--c-accent)', color: 'var(--c-neutral)' }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu toggle bar */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--c-neutral)',
            }}
          >
            <span className="flex items-center gap-2">
              <UtensilsCrossed size={15} color="var(--c-primary)" strokeWidth={1.8} />
              Menu — {sections[activeSection]?.name ?? 'All'}
            </span>
            <span className="text-xs opacity-60">{menuOpen ? 'Close' : 'Sections'}</span>
          </button>
        </div>

        {/* Collapsible sections dropdown */}
        {menuOpen && (
          <div
            className="px-4 pb-3 animate-fade-in"
          >
            <div className="grid grid-cols-2 gap-2">
              {sections.map((section, i) => {
                const Icon = getIcon(section.icon);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(i);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      background:
                        i === activeSection ? 'var(--c-primary)22' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === activeSection ? 'var(--c-primary)44' : 'transparent'}`,
                      color: 'var(--c-neutral)',
                    }}
                  >
                    <Icon size={15} color="var(--c-primary)" strokeWidth={1.8} />
                    {section.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Horizontal scrollable tabs */}
        {!loading && sections.length > 0 && (
          <div
            ref={tabsScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2 touch-scroll"
          >
            {sections.map((section, i) => {
              const Icon = getIcon(section.icon);
              const isActive = i === activeSection;
              return (
                <button
                  key={section.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  onClick={() => setActiveSection(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive ? 'animate-slide-in-right' : ''
                  }`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, var(--c-primary), var(--c-accent))`
                      : 'rgba(255,255,255,0.06)',
                    color: isActive ? 'var(--c-neutral)' : 'var(--c-neutral)',
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  <Icon size={14} strokeWidth={2} color={isActive ? 'var(--c-neutral)' : 'var(--c-secondary)'} />
                  {section.name}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Menu content */}
      <main className="px-4 pt-4">
        {loading ? (
          <SkeletonGrid />
        ) : activeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm opacity-50" style={{ color: 'var(--c-neutral)' }}>
              No items in this section yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeItems.map((item, i) => (
              <MenuItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Floating cart bar */}
      {totalItems > 0 && !loading && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-safe animate-slide-up"
        >
          <div
            className="mx-auto max-w-md flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-2xl mb-4"
            style={{
              background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))`,
            }}
          >
            <span className="flex items-center gap-2 font-medium text-sm" style={{ color: 'var(--c-neutral)' }}>
              <ShoppingBag size={18} strokeWidth={1.8} />
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
            <span className="font-bold text-sm" style={{ color: 'var(--c-neutral)' }}>
              View order →
            </span>
          </div>
        </button>
      )}

      {/* Contact / Reserve modal */}
      {contactOpen && (
        <ContactModal settings={settings} onClose={() => setContactOpen(false)} />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <div className="aspect-[3/2] skeleton" />
          <div className="p-3">
            <div className="h-4 w-2/3 skeleton mb-2" />
            <div className="h-3 w-1/3 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactModal({
  settings,
  onClose,
}: {
  settings: RestaurantSettings | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="glass-card-dark w-full max-w-md p-6 animate-slide-up sm:animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '24px 24px 0 0' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}
          >
            Contact & Reserve
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <X size={18} color="var(--c-neutral)" strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-3">
          <a
            href="tel:+15551234567"
            className="flex items-center gap-3 p-3 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Phone size={18} color="var(--c-primary)" strokeWidth={1.8} />
            <span className="text-sm" style={{ color: 'var(--c-neutral)' }}>
              Call (555) 123-4567
            </span>
          </a>
          <div
            className="p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--c-neutral)' }}
          >
            <p className="font-medium mb-1" style={{ color: 'var(--c-secondary)' }}>
              {settings?.name ?? 'Safari Fresh Chicken Charcoal & Fish Grill'}
            </p>
            <p className="opacity-70">
              123 Via Roma, Florence, Italy
            </p>
            <p className="opacity-70 mt-1">
              Open daily · 12:00 — 23:00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
