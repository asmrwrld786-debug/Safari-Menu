import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Check, Loader2, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { RestaurantSettings } from '@/types';

interface Props {
  settings: RestaurantSettings | null;
}

type CheckoutStage = 'cart' | 'checkout' | 'processing' | 'success';

export function OrderDrawer({ settings }: Props) {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const [stage, setStage] = useState<CheckoutStage>('cart');
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [orderNumber] = useState(() => Math.floor(1000 + Math.random() * 9000));

  useEffect(() => {
    if (!cartOpen) {
      setTimeout(() => setStage('cart'), 300);
    }
  }, [cartOpen]);

  if (!cartOpen) return null;

  const handleCheckout = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);

    if (navigator.vibrate) navigator.vibrate(20);
    setStage('checkout');
  };

  const handlePay = () => {
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    setStage('processing');
    setTimeout(() => {
      setStage('success');
      if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 60]);
    }, 1800);
  };

  const handleClose = () => {
    if (stage === 'success') {
      clearCart();
    }
    setCartOpen(false);
  };

  const taxRate = 0.08;
  const tax = totalPrice * taxRate;
  const grandTotal = totalPrice + tax;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        style={{
          background: 'linear-gradient(180deg, #2d2018 0%, #1a1410 100%)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '85vh',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}
          >
            {stage === 'cart' && 'Your Order'}
            {stage === 'checkout' && 'Checkout'}
            {stage === 'processing' && 'Processing…'}
            {stage === 'success' && 'Order Confirmed'}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <X size={18} color="var(--c-neutral)" strokeWidth={2} />
          </button>
        </div>

        {/* ── Cart stage ── */}
        {stage === 'cart' && (
          <div className="px-5 pb-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingBag size={40} color="var(--c-primary)" strokeWidth={1} style={{ opacity: 0.4 }} />
                <p className="mt-3 text-sm opacity-50" style={{ color: 'var(--c-neutral)' }}>
                  Your order is empty. Tap on items to add them.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl animate-fade-in-up"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <div
                        className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--c-dark-soft)' }}
                      >
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--c-neutral)' }}>
                          {item.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--c-secondary)' }}>
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                          <Minus size={14} color="var(--c-neutral)" strokeWidth={2} />
                        </button>
                        <span
                          className="text-sm font-medium w-5 text-center"
                          style={{ color: 'var(--c-neutral)' }}
                        >
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                          <Plus size={14} color="var(--c-neutral)" strokeWidth={2} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} color="var(--c-accent)" strokeWidth={1.8} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--c-neutral)', opacity: 0.7 }}>
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: 'var(--c-primary)' }}
                  >
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  className="ripple-btn w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-transform active:scale-95"
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
                  Proceed to Checkout
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Checkout stage ── */}
        {stage === 'checkout' && (
          <div className="px-5 pb-6 animate-fade-in">
            <div className="space-y-4">
              {/* Table number */}
              <div>
                <label className="text-xs uppercase tracking-wider opacity-60 mb-2 block" style={{ color: 'var(--c-neutral)' }}>
                  Table Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--c-neutral)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              {/* Payment method */}
              <div>
                <label className="text-xs uppercase tracking-wider opacity-60 mb-2 block" style={{ color: 'var(--c-neutral)' }}>
                  Payment Method
                </label>
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--c-primary)33' }}
                >
                  <CreditCard size={20} color="var(--c-primary)" strokeWidth={1.8} />
                  <span className="text-sm font-medium" style={{ color: 'var(--c-neutral)' }}>
                    Pay at Counter
                  </span>
                  <Check size={18} color="var(--c-primary)" strokeWidth={2.5} className="ml-auto" />
                </div>
              </div>

              {/* Summary */}
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex justify-between text-sm" style={{ color: 'var(--c-neutral)', opacity: 0.7 }}>
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--c-neutral)', opacity: 0.7 }}>
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex justify-between font-bold text-base" style={{ color: 'var(--c-neutral)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--c-primary)' }}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-transform active:scale-95"
                style={{
                  background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))`,
                  color: 'var(--c-neutral)',
                }}
              >
                Place Order · ${grandTotal.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* ── Processing stage ── */}
        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <Loader2 size={48} color="var(--c-primary)" strokeWidth={1.5} className="animate-spin" />
            <p className="mt-4 text-sm opacity-60" style={{ color: 'var(--c-neutral)' }}>
              Sending your order to the kitchen…
            </p>
          </div>
        )}

        {/* ── Success stage ── */}
        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 px-5 animate-fade-in">
            <div className="relative mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--c-primary), var(--c-accent))`,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="var(--c-neutral)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="30"
                    strokeDashoffset="30"
                    style={{ animation: 'checkmark-draw 0.5s ease-out 0.2s forwards' }}
                  />
                </svg>
              </div>
            </div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-neutral)' }}
            >
              Thank you!
            </h3>
            <p className="text-sm text-center opacity-70 mb-1" style={{ color: 'var(--c-neutral)' }}>
              Your order has been placed.
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--c-secondary)' }}>
              Order #{orderNumber}
            </p>
            <div
              className="w-full p-4 rounded-xl text-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="text-xs uppercase tracking-wider opacity-50 mb-1" style={{ color: 'var(--c-neutral)' }}>
                Amount Due
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--c-primary)' }}>
                ${grandTotal.toFixed(2)}
              </p>
              <p className="text-xs mt-1 opacity-50" style={{ color: 'var(--c-neutral)' }}>
                Please pay at the counter
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl font-medium text-sm transition-colors"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--c-neutral)',
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </>
  );
}
