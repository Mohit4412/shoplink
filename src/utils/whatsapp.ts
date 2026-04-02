/**
 * Builds a wa.me URL with a prefilled order confirmation message.
 *
 * @param phone  - Seller's WhatsApp number (any format, digits extracted automatically)
 * @param params - Order details to embed in the message
 */
export interface WhatsAppOrderParams {
  productName: string;
  customerName: string;
  customerPhone: string;
  email?: string;
  city?: string;
  address?: string;
  pincode?: string;
  quantity: number;
}

export function buildOrderWhatsAppUrl(
  phone: string,
  params: WhatsAppOrderParams
): string {
  const digits = phone.replace(/\D/g, '');

  const lines = [
    'Hi, I just placed an order.',
    '',
    `Product: ${params.productName}`,
    `Name: ${params.customerName}`,
    `Phone: ${params.customerPhone}`,
    ...(params.email ? [`Email: ${params.email}`] : []),
    `Quantity: ${params.quantity}`,
    ...(params.address || params.pincode || params.city ? [
      '',
      'Shipping address:',
      ...(params.address ? [params.address] : []),
      [params.city, params.pincode].filter(Boolean).join(', '),
    ].filter(Boolean) : []),
  ];

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
