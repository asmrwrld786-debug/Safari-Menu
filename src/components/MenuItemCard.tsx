import { useEffect, useRef, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import type { MenuItem } from '@/types';
import { useCart } from '@/hooks/useCart';

interface Props {
  item: MenuItem;
  index: number;
}

export function MenuItemCard({ item, index }: Props) {
  const { addToCart } = useCart();
  const [flipped, setFlipped] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true);
  }, []);

  const handleFlip = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    setFlipped((f) => !f);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);

    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
    setAdding(true);
    addToCart(item);
    setTimeout(() => setAdding(false), 150);
  };

  if (!item.is_available) {
    return (
      <div
        className="relative rounded-2xl overflow-hidden opacity-50"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="aspect-[3/2] skeleton" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs tracking-widest uppercase opacity-60">Sold Out</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`flip-card ${flipped ? 'flipped' : ''} animate-fade-in-up`}
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
      onClick={handleFlip}
    >
      <div className="flip-card-inner" style={{ aspectRatio: '3/2' }}>
        {/* Front — image */}
        <div className="flip-card-front">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          {imgError ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--c-dark-soft)' }}
            >
              <span className="text-xs opacity-40">No image</span>
            </div>
          ) : (
            <img
              ref={imgRef}
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(true);
              }}
              className="w-full h-full object-cover"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
            />
          )}
          <div
            className="absolute inset-0 flex flex-col justify-end p-4"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
            }}
          >
            <h3
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}
            >
              {item.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--c-secondary)' }}
              >
                ${item.price.toFixed(2)}
              </span>
              <span
                className="text-[10px] tracking-widest uppercase opacity-50"
                style={{ color: 'var(--c-neutral)' }}
              >
                Tap for details
              </span>
            </div>
          </div>
        </div>

        {/* Back — details + add button */}
        <div
          className="flip-card-back flex flex-col justify-between p-5"
          style={{
            background: `linear-gradient(160deg, var(--c-dark-soft), var(--c-dark))`,
            border: `1px solid var(--c-primary)33`,
          }}
        >
          <div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-secondary)' }}
            >
              {item.name}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--c-neutral)', opacity: 0.8 }}
            >
              {item.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span
              className="text-xl font-bold"
              style={{ color: 'var(--c-primary)' }}
            >
              ${item.price.toFixed(2)}
            </span>
            <button
              onClick={handleAdd}
              className={`ripple-btn flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-transform ${
                adding ? 'animate-scale-bounce' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))`,
                color: 'var(--c-neutral)',
              }}
            >
              {ripples.map((r) => (
                <span
                  key={r.id}
                  className="ripple-effect"
                  style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
                />
              ))}
              {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add to order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
