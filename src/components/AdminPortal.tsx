import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Lock, LogOut, Palette, Image as ImageIcon, UtensilsCrossed, Plus, Edit3,
  Trash2, GripVertical, X, Check, Save, Upload, ArrowUp, ArrowDown, Eye, Settings as SettingsIcon
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { RestaurantSettings, MenuSection, MenuItem } from '@/types';
import { useRestaurantData } from '@/hooks/useRestaurantData';

type AdminTab = 'branding' | 'menu' | 'background';

export function AdminPortal() {
  const { settings, sections, items, loading, refetch } = useRestaurantData();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>('branding');

  if (!authed) {
    return <AdminLogin settings={settings} loading={loading} onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-dark)', minHeight: '100dvh' }}>
      {/* Admin header */}
      <header
        className="sticky top-0 z-40 pt-safe"
        style={{
          background: 'rgba(26,20,16,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} color="var(--c-primary)" strokeWidth={1.8} />
            <span className="font-bold text-base" style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}>
              Admin Portal
            </span>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--c-neutral)' }}
          >
            <LogOut size={15} strokeWidth={1.8} />
            Logout
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-2">
          {([
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
            { id: 'background', label: 'Background', icon: ImageIcon },
          ] as { id: AdminTab; label: string; icon: typeof Palette }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === id ? 'var(--c-primary)22' : 'transparent',
                color: tab === id ? 'var(--c-primary)' : 'var(--c-neutral)',
                opacity: tab === id ? 1 : 0.5,
              }}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-5 max-w-2xl mx-auto pb-20">
        {tab === 'branding' && <BrandingEditor settings={settings} loading={loading} refetch={refetch} />}
        {tab === 'menu' && (
          <MenuEditor sections={sections} items={items} loading={loading} refetch={refetch} />
        )}
        {tab === 'background' && <BackgroundEditor settings={settings} loading={loading} refetch={refetch} />}
      </main>
    </div>
  );
}

// ── Admin Login ──────────────────────────────────────────────
function AdminLogin({
  settings,
  loading,
  onSuccess,
}: {
  settings: RestaurantSettings | null;
  loading: boolean;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !settings) return;
    if (password === settings.admin_password) {
      if (navigator.vibrate) navigator.vibrate(20);
      onSuccess();
    } else {
      setError(true);
      if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #1a1410 0%, #2d2018 50%, #1a1410 100%)', minHeight: '100dvh' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))' }}
      >
        <Lock size={28} color="var(--c-neutral)" strokeWidth={1.5} />
      </div>
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}
      >
        Admin Portal
      </h1>
      <p className="text-sm opacity-50 mb-8" style={{ color: 'var(--c-neutral)' }}>
        {settings?.name ?? 'Safari Fresh Chicken Charcoal & Fish Grill'}
      </p>
      <form onSubmit={handleSubmit} className={`w-full max-w-xs ${error ? 'animate-shake' : ''}`}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          disabled={loading}
          className="w-full px-4 py-3.5 rounded-xl text-sm text-center outline-none mb-3"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--c-neutral)',
            border: `1px solid ${error ? 'var(--c-accent)' : 'rgba(255,255,255,0.1)'}`,
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))',
            color: 'var(--c-neutral)',
          }}
        >
          Unlock
        </button>
        {error && (
          <p className="text-center text-sm mt-3 animate-fade-in" style={{ color: 'var(--c-accent)' }}>
            Incorrect password
          </p>
        )}
      </form>
      <p className="text-xs opacity-30 mt-6" style={{ color: 'var(--c-neutral)' }}>
        Demo password: admin123
      </p>
    </div>
  );
}

// ── Branding Editor ──────────────────────────────────────────
function BrandingEditor({
  settings,
  loading,
  refetch,
}: {
  settings: RestaurantSettings | null;
  loading: boolean;
  refetch: () => Promise<void>;
}) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (loading || !form) return <LoadingSpinner />;

  const update = (field: keyof RestaurantSettings, value: string) => {
    setForm((f) => ({ ...f!, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('restaurant_settings')
      .update({
        name: form.name,
        tagline: form.tagline,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        accent_color: form.accent_color,
        neutral_color: form.neutral_color,
        logo_url: form.logo_url,
        admin_password: form.admin_password,
      })
      .eq('id', 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      if (navigator.vibrate) navigator.vibrate(20);
      refetch();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const colors: { field: keyof RestaurantSettings; label: string }[] = [
    { field: 'primary_color', label: 'Primary' },
    { field: 'secondary_color', label: 'Secondary' },
    { field: 'accent_color', label: 'Accent' },
    { field: 'neutral_color', label: 'Neutral' },
  ];

  return (
    <div className="space-y-5">
      {/* Restaurant name */}
      <Card title="Restaurant Identity" icon={SettingsIcon}>
        <Field label="Restaurant Name">
          <TextInput value={form.name} onChange={(v) => update('name', v)} />
        </Field>
        <Field label="Tagline">
          <TextInput value={form.tagline} onChange={(v) => update('tagline', v)} />
        </Field>
      </Card>

      {/* Logo URL */}
      <Card title="Logo" icon={ImageIcon}>
        <Field label="Logo Image URL">
          <TextInput
            value={form.logo_url ?? ''}
            onChange={(v) => update('logo_url', v)}
            placeholder="https://…"
          />
        </Field>
        {form.logo_url && (
          <div
            className="w-16 h-16 rounded-xl overflow-hidden mt-2"
            style={{ background: 'var(--c-dark-soft)' }}
          >
            <img src={form.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
          </div>
        )}
      </Card>

      {/* Color picker */}
      <Card title="Color Palette" icon={Palette}>
        <p className="text-xs opacity-50 mb-3" style={{ color: 'var(--c-neutral)' }}>
          Colors update the live preview instantly.
        </p>
        <div className="space-y-3">
          {colors.map(({ field, label }) => (
            <div key={field} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--c-neutral)' }}>
                {label}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form[field] as string}
                  onChange={(e) => {
                    update(field, e.target.value);
                    document.documentElement.style.setProperty(
                      `--c-${field.replace('_color', '')}`,
                      e.target.value
                    );
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  style={{ background: 'transparent' }}
                />
                <input
                  type="text"
                  value={form[field] as string}
                  onChange={(e) => {
                    update(field, e.target.value);
                    document.documentElement.style.setProperty(
                      `--c-${field.replace('_color', '')}`,
                      e.target.value
                    );
                  }}
                  className="w-24 px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--c-neutral)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live preview card */}
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-wider opacity-40 mb-2" style={{ color: 'var(--c-neutral)' }}>
            Preview
          </p>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}>
            {form.name}
          </h3>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--c-primary)', color: 'var(--c-neutral)' }}>
              Primary
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--c-accent)', color: 'var(--c-neutral)' }}>
              Accent
            </span>
          </div>
        </div>
      </Card>

      {/* Admin password */}
      <Card title="Security" icon={Lock}>
        <Field label="Admin Password">
          <TextInput
            value={form.admin_password}
            onChange={(v) => update('admin_password', v)}
          />
        </Field>
      </Card>

      {/* Save button */}
      <SaveButton saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

// ── Background Editor ────────────────────────────────────────
function BackgroundEditor({
  settings,
  loading,
  refetch,
}: {
  settings: RestaurantSettings | null;
  loading: boolean;
  refetch: () => Promise<void>;
}) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (loading || !form) return <LoadingSpinner />;

  const update = (field: keyof RestaurantSettings, value: string) => {
    setForm((f) => ({ ...f!, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('restaurant_settings')
      .update({
        bg_type: form.bg_type,
        bg_value: form.bg_value,
        bg_image_url: form.bg_image_url,
        hero_image_url: form.hero_image_url,
      })
      .eq('id', 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const bgTypes: { value: string; label: string }[] = [
    { value: 'color', label: 'Solid Color' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'image', label: 'Image' },
  ];

  return (
    <div className="space-y-5">
      <Card title="Background Type" icon={ImageIcon}>
        <div className="grid grid-cols-3 gap-2">
          {bgTypes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => update('bg_type', value)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: form.bg_type === value ? 'var(--c-primary)22' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.bg_type === value ? 'var(--c-primary)44' : 'transparent'}`,
                color: form.bg_type === value ? 'var(--c-primary)' : 'var(--c-neutral)',
                opacity: form.bg_type === value ? 1 : 0.6,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {form.bg_type === 'color' && (
        <Card title="Solid Color" icon={Palette}>
          <Field label="Background Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.bg_value.startsWith('#') ? form.bg_value : '#1a1410'}
                onChange={(e) => update('bg_value', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
              />
              <TextInput value={form.bg_value} onChange={(v) => update('bg_value', v)} />
            </div>
          </Field>
        </Card>
      )}

      {form.bg_type === 'gradient' && (
        <Card title="Gradient" icon={Palette}>
          <Field label="CSS Gradient Value">
            <textarea
              value={form.bg_value}
              onChange={(e) => update('bg_value', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-xs font-mono outline-none resize-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--c-neutral)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </Field>
          <div className="mt-2 h-20 rounded-xl" style={{ background: form.bg_value }} />
        </Card>
      )}

      {form.bg_type === 'image' && (
        <Card title="Background Image" icon={ImageIcon}>
          <Field label="Image URL">
            <TextInput
              value={form.bg_image_url ?? ''}
              onChange={(v) => update('bg_image_url', v)}
              placeholder="https://…"
            />
          </Field>
          {form.bg_image_url && (
            <div className="mt-2 h-24 rounded-xl overflow-hidden">
              <img src={form.bg_image_url} alt="BG preview" className="w-full h-full object-cover" />
            </div>
          )}
        </Card>
      )}

      <Card title="Landing Hero Image" icon={ImageIcon}>
        <Field label="Hero Image URL">
          <TextInput
            value={form.hero_image_url ?? ''}
            onChange={(v) => update('hero_image_url', v)}
            placeholder="https://…"
          />
        </Field>
        {form.hero_image_url && (
          <div className="mt-2 h-24 rounded-xl overflow-hidden">
            <img src={form.hero_image_url} alt="Hero preview" className="w-full h-full object-cover" />
          </div>
        )}
      </Card>

      <SaveButton saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

// ── Menu Editor ──────────────────────────────────────────────
function MenuEditor({
  sections,
  items,
  loading,
  refetch,
}: {
  sections: MenuSection[];
  items: MenuItem[];
  loading: boolean;
  refetch: () => Promise<void>;
}) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<number | null>(null);

  if (loading) return <LoadingSpinner />;

  const moveSection = async (from: number, to: number) => {
    const reordered = [...sections];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('menu_sections').update({ sort_order: i }).eq('id', reordered[i].id);
    }
    refetch();
  };

  const addSection = async () => {
    const name = `New Section ${sections.length + 1}`;
    const { error } = await supabase
      .from('menu_sections')
      .insert({ name, icon: 'UtensilsCrossed', sort_order: sections.length });
    if (!error) refetch();
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase.from('menu_sections').delete().eq('id', id);
    if (!error) {
      if (selectedSection === id) setSelectedSection(null);
      refetch();
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) refetch();
  };

  const sectionItems = selectedSection
    ? items.filter((i) => i.section_id === selectedSection).sort((a, b) => a.sort_order - b.sort_order)
    : [];

  return (
    <div className="space-y-4">
      {/* Sections list */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: 'var(--c-neutral)' }}>
          Menu Sections
        </h2>
        <button
          onClick={addSection}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'var(--c-primary)22', color: 'var(--c-primary)' }}
        >
          <Plus size={14} strokeWidth={2} />
          Add Section
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDraggedSection(i)}
            onDragEnd={() => {
              setDraggedSection(null);
              setDragOverSection(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverSection(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedSection !== null && draggedSection !== i) {
                moveSection(draggedSection, i);
              }
            }}
            className="glass-card-dark p-3 transition-all"
            style={{
              opacity: draggedSection === i ? 0.4 : 1,
              border: `1px solid ${dragOverSection === i ? 'var(--c-primary)' : 'rgba(255,255,255,0.08)'}`,
              transform: dragOverSection === i ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.25s ease, border 0.25s ease',
            }}
          >
            <div className="flex items-center gap-2">
              <GripVertical size={18} color="var(--c-primary)" strokeWidth={1.5} style={{ opacity: 0.5, cursor: 'grab' }} />
              <button
                onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                className="flex-1 text-left text-sm font-medium"
                style={{ color: 'var(--c-neutral)' }}
              >
                {section.name}
              </button>
              <span className="text-xs opacity-40" style={{ color: 'var(--c-neutral)' }}>
                {items.filter((it) => it.section_id === section.id).length} items
              </span>
              <button
                onClick={() => deleteSection(section.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <Trash2 size={13} color="var(--c-accent)" strokeWidth={1.8} />
              </button>
            </div>

            {/* Items in section */}
            {selectedSection === section.id && (
              <div className="mt-3 space-y-2 animate-fade-in">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    {item.image_url && (
                      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--c-neutral)' }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <Edit3 size={12} color="var(--c-neutral)" strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <Trash2 size={12} color="var(--c-accent)" strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setAddingItem(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--c-primary)' }}
                >
                  <Plus size={14} strokeWidth={2} />
                  Add Item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Item editor modal */}
      {(editingItem || addingItem) && (
        <ItemEditorModal
          item={editingItem}
          sectionId={selectedSection ?? sections[0]?.id ?? ''}
          onClose={() => {
            setEditingItem(null);
            setAddingItem(false);
          }}
          onSaved={() => {
            setEditingItem(null);
            setAddingItem(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// ── Item Editor Modal ────────────────────────────────────────
function ItemEditorModal({
  item,
  sectionId,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  sectionId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item?.price.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      section_id: sectionId,
      name,
      description,
      price: parseFloat(price) || 0,
      image_url: imageUrl,
      sort_order: item?.sort_order ?? 0,
    };
    if (item) {
      await supabase.from('menu_items').update(payload).eq('id', item.id);
    } else {
      await supabase.from('menu_items').insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="glass-card-dark w-full max-w-md p-5 animate-fade-in-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}>
            {item ? 'Edit Item' : 'Add Item'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <X size={18} color="var(--c-neutral)" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Name">
            <TextInput value={name} onChange={setName} />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--c-neutral)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </Field>
          <Field label="Price ($)">
            <TextInput value={price} onChange={setPrice} type="number" />
          </Field>
          <Field label="Image URL">
            <TextInput value={imageUrl} onChange={setImageUrl} placeholder="https://…" />
          </Field>
          {imageUrl && (
            <div className="aspect-[3/2] rounded-xl overflow-hidden">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))',
            color: 'var(--c-neutral)',
          }}
        >
          <Save size={16} strokeWidth={2} />
          {saving ? 'Saving…' : 'Save Item'}
        </button>
      </div>
    </div>
  );
}

// ── Shared UI components ─────────────────────────────────────
function Card({ title, icon: Icon, children }: { title: string; icon: typeof Palette; children: React.ReactNode }) {
  return (
    <div className="glass-card-dark p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} color="var(--c-primary)" strokeWidth={1.8} />
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--c-neutral)' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs opacity-50 mb-1.5 block" style={{ color: 'var(--c-neutral)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
      style={{
        background: 'rgba(255,255,255,0.06)',
        color: 'var(--c-neutral)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
}

function SaveButton({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-transform active:scale-95 sticky bottom-4"
      style={{
        background: saved
          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
          : 'linear-gradient(135deg, var(--c-primary), var(--c-accent))',
        color: 'var(--c-neutral)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      {saving ? (
        'Saving…'
      ) : saved ? (
        <>
          <Check size={18} strokeWidth={2.5} /> Saved!
        </>
      ) : (
        <>
          <Save size={18} strokeWidth={2} /> Save Changes
        </>
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}
