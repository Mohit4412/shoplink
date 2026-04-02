'use client';

import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { PaymentSettings, Product } from '../../types';
import { OrderPaymentMethod } from '../../utils/orderLeads';
import { OrderForm, OrderFormValues } from './OrderForm';
import { getAvailableOrderPaymentMethods } from '../../utils/orderLeads';

// Re-export so existing callers don't need to change their imports
export type PublicOrderRequestInput = OrderFormValues;
export type { OrderPaymentMethod };

interface OrderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  storeName: string;
  currencySymbol: string;
  paymentSettings?: PaymentSettings;
  onSubmit: (input: PublicOrderRequestInput) => Promise<void>;
  onWhatsAppOnly?: () => void;
}

export function OrderRequestModal({
  isOpen,
  onClose,
  product,
  storeName,
  currencySymbol,
  paymentSettings,
  onSubmit,
  onWhatsAppOnly,
}: OrderRequestModalProps) {
  // Key forces OrderForm to remount (and reset state) when product changes
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (isOpen) setFormKey((k) => k + 1);
  }, [isOpen, product?.id]);

  if (!product) return null;

  const handleSubmit = async (values: PublicOrderRequestInput) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place an Order" className="max-w-lg">
      <OrderForm
        key={formKey}
        product={product}
        storeName={storeName}
        currencySymbol={currencySymbol}
        paymentMethods={getAvailableOrderPaymentMethods(paymentSettings)}
        onSubmit={handleSubmit}
        onWhatsAppOnly={onWhatsAppOnly}
        onCancel={onClose}
      />
    </Modal>
  );
}
