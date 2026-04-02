import { PaymentSettings } from '../types';

export type OrderPaymentMethod = 'whatsapp' | 'upi' | 'cod' | 'bank_transfer' | 'stripe';
export type OrderSource = 'link' | 'website';

export interface OrderLeadDetails {
  customerName?: string;
  customerPhone?: string;
  email?: string;
  city?: string;
  address?: string;
  pincode?: string;
  paymentMethod?: OrderPaymentMethod;
  source?: OrderSource;
  selectedVariants?: Record<string, string>;
}

export interface ParsedOrderLead {
  details: OrderLeadDetails;
  buyerNotes: string;
}

const ORDER_LEAD_PREFIX = '[[myshoplink-order-lead]]';

export function serializeOrderLeadNotes(details: OrderLeadDetails, buyerNotes?: string) {
  const normalizedDetails: OrderLeadDetails = {
    customerName: details.customerName?.trim() || undefined,
    customerPhone: details.customerPhone?.trim() || undefined,
    email: details.email?.trim() || undefined,
    city: details.city?.trim() || undefined,
    address: details.address?.trim() || undefined,
    pincode: details.pincode?.trim() || undefined,
    paymentMethod: details.paymentMethod || undefined,
    source: details.source || undefined,
    selectedVariants: details.selectedVariants && Object.keys(details.selectedVariants).length > 0
      ? details.selectedVariants
      : undefined,
  };

  const encoded = encodeURIComponent(JSON.stringify(normalizedDetails));
  const normalizedBuyerNotes = buyerNotes?.trim() || '';

  return normalizedBuyerNotes
    ? `${ORDER_LEAD_PREFIX}${encoded}\n${normalizedBuyerNotes}`
    : `${ORDER_LEAD_PREFIX}${encoded}`;
}

export function parseOrderLeadNotes(notes?: string | null): ParsedOrderLead {
  const fallback = {
    details: {},
    buyerNotes: notes?.trim() || '',
  };

  if (!notes?.startsWith(ORDER_LEAD_PREFIX)) {
    return fallback;
  }

  const raw = notes.slice(ORDER_LEAD_PREFIX.length);
  const newlineIndex = raw.indexOf('\n');
  const encodedDetails = newlineIndex === -1 ? raw : raw.slice(0, newlineIndex);
  const buyerNotes = newlineIndex === -1 ? '' : raw.slice(newlineIndex + 1).trim();

  try {
    const parsed = JSON.parse(decodeURIComponent(encodedDetails)) as OrderLeadDetails;
    return {
      details: parsed ?? {},
      buyerNotes,
    };
  } catch {
    return fallback;
  }
}

export function formatPaymentMethodLabel(method?: OrderPaymentMethod) {
  switch (method) {
    case 'stripe':
      return 'Pay online';
    case 'upi':
      return 'UPI';
    case 'cod':
      return 'Cash on delivery';
    case 'bank_transfer':
      return 'Bank transfer';
    case 'whatsapp':
      return 'Discuss on WhatsApp';
    default:
      return '';
  }
}

export function getAvailableOrderPaymentMethods(paymentSettings?: PaymentSettings) {
  const methods: OrderPaymentMethod[] = [];
  const stripeEnabled =
    paymentSettings?.enableOnlineCheckout &&
    paymentSettings.checkoutProvider === 'stripe' &&
    paymentSettings.stripe?.accountId &&
    paymentSettings.stripe?.onboardingComplete &&
    paymentSettings.stripe?.chargesEnabled;

  if (stripeEnabled) {
    methods.push('stripe');
  }
  methods.push('cod');

  if (paymentSettings?.upiId) {
    methods.push('upi');
  }
  if (paymentSettings?.bankAccountNumber) {
    methods.push('bank_transfer');
  }

  methods.push('whatsapp');
  return Array.from(new Set(methods));
}
