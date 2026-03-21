import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
}

export function DeleteProductModal({ isOpen, onClose, onConfirm, productName }: DeleteProductModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Product"
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Are you sure you want to delete <strong>{productName}</strong>? This action cannot be undone.
        </p>
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
}
