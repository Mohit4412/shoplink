'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, MessageCircle, ShoppingBag } from 'lucide-react';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { OrderPaymentMethod, formatPaymentMethodLabel } from '../../utils/orderLeads';

export interface OrderFormProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  variants?: { name: string; options: string[] }[];
}

export interface OrderFormValues {
  quantity: number;
  customerName: string;
  customerPhone: string;
  email: string;
  city: string;
  address: string;
  pincode: string;
  paymentMethod: OrderPaymentMethod;
  notes: string;
  selectedVariants: Record<string, string>; // { "Size": "M", "Color": "Red" }
}

export interface OrderFormProps {
  /** Product being ordered */
  product: OrderFormProduct;
  /** Store name shown in the product preview */
  storeName: string;
  /** Currency symbol e.g. "₹" */
  currencySymbol: string;
  /** Called with validated form values on submit */
  onSubmit: (values: OrderFormValues) => Promise<void>;
  /** Optional: renders a "Skip form, chat on WhatsApp" link */
  onWhatsAppOnly?: () => void;
  /** Optional: called when Cancel is clicked */
  onCancel?: () => void;
}

const PAYMENT_METHODS: OrderPaymentMethod[] = ['whatsapp', 'upi', 'cod', 'bank_transfer'];

/** Accepts Indian numbers: 10 digits, optionally prefixed with +91 or 0 */
const INDIAN_PHONE_RE = /^(?:\+91|91|0)?[6-9]\d{9}$/;

type FieldErrors = Partial<Record<'customerName' | 'customerPhone' | 'quantity' | 'address' | 'pincode' | 'email' | string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: OrderFormValues, product: OrderFormProduct): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.customerName.trim()) {
    errors.customerName = 'Name is required.';
  }

  const rawPhone = form.customerPhone.replace(/\s+/g, '');
  if (!rawPhone) {
    errors.customerPhone = 'Phone number is required.';
  } else if (!INDIAN_PHONE_RE.test(rawPhone)) {
    errors.customerPhone = 'Enter a valid Indian mobile number.';
  }

  if (form.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1.';
  }

  const trimmedAddress = form.address.trim();
  if (!trimmedAddress) {
    errors.address = 'Address is required.';
  } else if (trimmedAddress.length < 10) {
    errors.address = 'Address must be at least 10 characters.';
  }

  const rawPin = form.pincode.trim();
  if (!rawPin) {
    errors.pincode = 'Pincode is required.';
  } else if (!/^\d{6}$/.test(rawPin)) {
    errors.pincode = 'Enter a valid 6-digit pincode.';
  }

  const trimmedEmail = form.email.trim();
  if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  // Each variant must have a selection
  for (const variant of product.variants ?? []) {
    if (!form.selectedVariants[variant.name]) {
      errors[`variant_${variant.name}`] = `Please select a ${variant.name}.`;
    }
  }

  return errors;
}

/** Safely reads a non-empty string from URLSearchParams */
function param(searchParams: ReturnType<typeof useSearchParams>, key: string): string {
  const val = searchParams?.get(key);
  return typeof val === 'string' ? val.trim() : '';
}

export function OrderForm({
  product,
  storeName,
  currencySymbol,
  onSubmit,
  onWhatsAppOnly,
  onCancel,
}: OrderFormProps) {
  const searchParams = useSearchParams();

  // Read query params once — used only as initial values, never re-applied
  const [form, setForm] = useState<OrderFormValues>(() => ({
    quantity: 1,
    customerName: param(searchParams, 'name'),
    customerPhone: param(searchParams, 'phone'),
    email: param(searchParams, 'email'),
    city: param(searchParams, 'city'),
    address: '',
    pincode: '',
    paymentMethod: 'whatsapp',
    notes: '',
    selectedVariants: {},
  }));

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const total = useMemo(
    () => product.price * Math.max(1, form.quantity),
    [product.price, form.quantity]
  );

  const set = <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the inline error for this field as soon as the user edits it
    if (key in fieldErrors) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[key as keyof FieldErrors]; return next; });
    }
  };

  // Auto-detect city when a valid 6-digit pincode is entered
  const handlePincodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    set('pincode', digits);

    if (digits.length === 6) {
      setPincodeLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${digits}`)
        .then(r => r.json())
        .then((data) => {
          const postOffice = data?.[0]?.PostOffice?.[0];
          if (postOffice?.District) {
            // Only prefill if user hasn't already typed something
            setForm(prev => ({
              ...prev,
              city: prev.city.trim() ? prev.city : postOffice.District,
            }));
          }
        })
        .catch(() => { /* silently ignore — user can fill city manually */ })
        .finally(() => setPincodeLoading(false));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(form, product);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await onSubmit({
        ...form,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send order request right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Product preview */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-16 w-16 rounded-xl object-cover border border-gray-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-100 bg-white">
              <ShoppingBag className="h-6 w-6 text-gray-300" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{storeName}</p>
            <h3 className="mt-1 text-base font-bold text-gray-900">{product.name}</h3>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              {currencySymbol}{product.price.toFixed(2)} each
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Variant selectors — shown only when product has variants */}
        {(product.variants ?? []).filter(v => v.options.length > 0).map((variant) => (
          <div key={variant.name}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{variant.name}</label>
            <div className="flex flex-wrap gap-2">
              {variant.options.map((opt) => {
                const selected = form.selectedVariants[variant.name] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('selectedVariants', { ...form.selectedVariants, [variant.name]: opt })}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {fieldErrors[`variant_${variant.name}`] && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors[`variant_${variant.name}`]}</p>
            )}
          </div>
        ))}
        {/* Name + Phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Your name"
              value={form.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              placeholder="Riya Sharma"
              required
            />
            {fieldErrors.customerName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.customerName}</p>
            )}
          </div>
          <div>
            <Input
              label="Phone / WhatsApp"
              value={form.customerPhone}
              onChange={(e) => set('customerPhone', e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
            {fieldErrors.customerPhone && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.customerPhone}</p>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => set('quantity', Math.max(1, Number(e.target.value) || 1))}
            required
          />
          {fieldErrors.quantity && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.quantity}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="riya@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        {/* Shipping details */}
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Shipping details</p>
          <div>
            <Textarea
              label="Delivery address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="House no., street, area, landmark"
              required
            />
            {fieldErrors.address && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
            <div>
              <div className="relative">
                <Input
                  label="Pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="395001"
                  required
                />
                {pincodeLoading && (
                  <span className="absolute right-3 top-[34px] text-[11px] text-gray-400 animate-pulse">
                    Detecting…
                  </span>
                )}
              </div>
              {fieldErrors.pincode && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.pincode}</p>
              )}
            </div>
            <Input
              label="City"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Surat"
            />
          </div>
        </div>

        {/* Payment method */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Preferred payment</label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const active = form.paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => set('paymentMethod', method)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {formatPaymentMethodLabel(method)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Anything else?"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Color, size, delivery preference, or any question for the seller"
        />

        {/* Total summary */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Seller will confirm your order on WhatsApp.
          <span className="ml-1 font-semibold">
            Estimated total: {currencySymbol}{total.toFixed(2)}
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {onWhatsAppOnly ? (
            <button
              type="button"
              onClick={onWhatsAppOnly}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <MessageCircle className="h-4 w-4" />
              Skip form and chat on WhatsApp
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing order...
                </span>
              ) : (
                'Quick Order (30 sec)'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
