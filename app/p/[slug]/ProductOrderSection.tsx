'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircle, Copy, Check } from 'lucide-react';
import { OrderForm, OrderFormValues, OrderFormProduct } from '@/src/components/storefront/OrderForm';
import { getAvailableOrderPaymentMethods } from '@/src/utils/orderLeads';
import { buildOrderWhatsAppUrl } from '@/src/utils/whatsapp';
import { Product, PaymentSettings } from '@/src/types';

interface ProductOrderSectionProps {
  product: Product;
  storeName: string;
  currencySymbol: string;
  username: string;
  whatsappNumber: string;
  paymentSettings?: PaymentSettings;
}

interface SubmittedState {
  whatsappUrl: string;
  paymentMethod: string;
  amount: number;
  orderId: string;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`shrink-0 flex items-center gap-1 text-xs font-semibold transition-colors ${copied ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'}`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function UpiInstructions({ upiId, amount, currencySymbol, storeName, orderId, onDone }: {
  upiId: string; amount: number; currencySymbol: string; storeName: string; orderId: string; onDone: () => void;
}) {
  const [marking, setMarking] = useState(false);

  // Generate UPI deep link
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeName)}&am=${amount.toFixed(2)}&cu=INR`;

  const handlePaid = async () => {
    setMarking(true);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'payment_pending_verification' }),
      });
    } catch {
      // Non-blocking — proceed regardless
    } finally {
      setMarking(false);
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Pay <span className="font-bold">{currencySymbol}{amount.toFixed(2)}</span> to complete your order.
      </div>

      {/* UPI deep link button */}
      <a
        href={upiLink}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
      >
        Open UPI App to Pay
      </a>

      <CopyField label="UPI ID (manual)" value={upiId} />
      <p className="text-xs text-gray-400 text-center">
        Use GPay, PhonePe, Paytm or any UPI app. Amount: {currencySymbol}{amount.toFixed(2)}
      </p>

      {/* Separator */}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-sm text-gray-600 text-center mb-3">
          After payment, click confirm below.
        </p>
        <button
          type="button"
          onClick={handlePaid}
          disabled={marking}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {marking ? 'Confirming…' : 'I have paid ✓'}
        </button>
      </div>
    </div>
  );
}

function BankInstructions({ settings, amount, currencySymbol, onDone }: {
  settings: PaymentSettings; amount: number; currencySymbol: string; onDone: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Transfer <span className="font-bold">{currencySymbol}{amount.toFixed(2)}</span> to the bank account below, then click "I've transferred".
      </div>
      {settings.bankAccountName && <CopyField label="Account name" value={settings.bankAccountName} />}
      {settings.bankAccountNumber && <CopyField label="Account number" value={settings.bankAccountNumber} />}
      {settings.bankIfsc && <CopyField label="IFSC code" value={settings.bankIfsc} />}
      {settings.bankBranch && <CopyField label="Branch" value={settings.bankBranch} />}
      <button
        type="button"
        onClick={onDone}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
      >
        I've transferred ✓
      </button>
    </div>
  );
}

export function ProductOrderSection({
  product,
  storeName,
  currencySymbol,
  username,
  whatsappNumber,
  paymentSettings,
}: ProductOrderSectionProps) {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState<SubmittedState | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const checkoutState = searchParams?.get('checkout');
  const checkoutOrderId = searchParams?.get('order');
  const paymentMethods = getAvailableOrderPaymentMethods(paymentSettings);

  const formProduct: OrderFormProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    variants: product.variants ?? [],
  };

  const handleSubmit = async (values: OrderFormValues) => {
    const response = await fetch(`/api/stores/${username}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: values.quantity,
        revenue: product.price * values.quantity,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        email: values.email,
        city: values.city,
        address: values.address,
        pincode: values.pincode,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        selectedVariants: values.selectedVariants,
        source: 'link',
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || 'Could not send your order request.');

    if (payload?.paymentProvider === 'stripe') {
      if (!payload?.checkoutUrl) {
        throw new Error('Unable to start secure checkout right now.');
      }
      window.location.assign(payload.checkoutUrl);
      return;
    }

    const baseText = [
      'Hi, I just placed an order.',
      '',
      `Product: ${product.name}`,
      // Selected variants
      ...Object.entries(values.selectedVariants).map(([k, v]) => `${k}: ${v}`),
      `Name: ${values.customerName}`,
      `Phone: ${values.customerPhone}`,
      ...(values.email ? [`Email: ${values.email}`] : []),
      `Quantity: ${values.quantity}`,
      ...(values.address || values.pincode || values.city ? [
        '',
        'Shipping address:',
        ...(values.address ? [values.address] : []),
        [values.city, values.pincode].filter(Boolean).join(', '),
      ].filter(Boolean) : []),
      ...(payload.confirmUrl && payload.declineUrl ? [
        '',
        `✅ Confirm: ${payload.confirmUrl}`,
        `❌ Decline: ${payload.declineUrl}`,
      ] : []),
    ].join('\n');

    const phone = whatsappNumber.replace(/\D/g, '');
    setSubmitted({
      whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(baseText)}`,
      paymentMethod: values.paymentMethod,
      amount: product.price * values.quantity,
      orderId: payload.orderId ?? '',
    });
  };

  const handleWhatsAppOnly = () => {
    const url = buildOrderWhatsAppUrl(whatsappNumber, {
      productName: product.name,
      customerName: '',
      customerPhone: '',
      quantity: 1,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Step 2: payment instructions (UPI / bank transfer)
  if (submitted && !paymentDone) {
    const { paymentMethod, amount, whatsappUrl } = submitted;

    if (paymentMethod === 'upi' && paymentSettings?.upiId) {
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Order placed!</p>
              <p className="text-xs text-gray-500">Complete your payment below.</p>
            </div>
          </div>
          <UpiInstructions
            upiId={paymentSettings.upiId}
            amount={amount}
            currencySymbol={currencySymbol}
            storeName={storeName}
            orderId={submitted.orderId}
            onDone={() => setPaymentDone(true)}
          />
        </div>
      );
    }

    if (paymentMethod === 'bank_transfer' && paymentSettings?.bankAccountNumber) {
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Order placed!</p>
              <p className="text-xs text-gray-500">Complete your bank transfer below.</p>
            </div>
          </div>
          <BankInstructions
            settings={paymentSettings}
            amount={amount}
            currencySymbol={currencySymbol}
            onDone={() => setPaymentDone(true)}
          />
        </div>
      );
    }

    // COD or no payment details configured — go straight to WhatsApp
    setPaymentDone(true);
    return null;
  }

  // Step 3: success + WhatsApp CTA
  if (submitted && paymentDone) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">
            {submitted.paymentMethod === 'cod' ? 'Order placed!' : 'Payment submitted!'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Tap below to notify {storeName} on WhatsApp.
          </p>
        </div>
        <a
          href={submitted.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1ebe5d] transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Confirm on WhatsApp
        </a>
        <button
          onClick={() => { setSubmitted(null); setPaymentDone(false); }}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Place another order
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkoutState === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Payment received. We saved your order{checkoutOrderId ? ` (${checkoutOrderId})` : ''} and the seller can now process it.
        </div>
      ) : null}
      {checkoutState === 'cancel' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Checkout was cancelled. Your order request is still saved, so you can retry payment or choose another payment method below.
        </div>
      ) : null}
      <OrderForm
        product={formProduct}
        storeName={storeName}
        currencySymbol={currencySymbol}
        paymentMethods={paymentMethods}
        onSubmit={handleSubmit}
        onWhatsAppOnly={handleWhatsAppOnly}
      />
    </div>
  );
}
