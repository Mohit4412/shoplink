'use client';

import { useState, ReactNode } from 'react';
import { useStore } from '../../context/StoreContext';
import { LegalPages } from '../../types';
import { FileText, Truck, RotateCcw, Shield, Scale, ExternalLink, Plus, Edit2, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PageDef {
  key: keyof LegalPages;
  title: string;
  icon: ReactNode;
  description: string;
  placeholder: string;
}

const LEGAL_PAGES: PageDef[] = [
  {
    key: 'shipping',
    title: 'Shipping Policy',
    icon: <Truck className="w-5 h-5 text-blue-600" />,
    description: 'Delivery timelines, costs, regions you ship to',
    placeholder: `Example:

We process orders within 1–2 business days.

Standard delivery: 5–7 business days across India.
Express delivery: 1–3 business days (additional charges apply).

Shipping is free on orders above ₹999.
For remote areas, allow up to 10 business days.

Once shipped, you will receive a tracking number via WhatsApp.`,
  },
  {
    key: 'returns',
    title: 'Returns & Refunds',
    icon: <RotateCcw className="w-5 h-5 text-orange-600" />,
    description: 'How customers can return or exchange items',
    placeholder: `Example:

We accept returns within 7 days of delivery.

Items must be unused, unwashed, and in original packaging.
To initiate a return, message us on WhatsApp with your order details and photos.

Refunds are processed within 5–7 business days after we receive the item.

The following items are non-returnable:
- Customised or personalised products
- Perishable goods
- Items on sale`,
  },
  {
    key: 'privacy',
    title: 'Privacy Policy',
    icon: <Shield className="w-5 h-5 text-green-600" />,
    description: 'How you collect and use customer data',
    placeholder: `Example:

We collect only the information needed to process your order — your name, phone number, and delivery address.

We do not sell or share your personal data with third parties.

Your WhatsApp number is used solely to communicate about your order.

By shopping with us, you agree to this privacy policy.`,
  },
  {
    key: 'terms',
    title: 'Terms of Service',
    icon: <Scale className="w-5 h-5 text-purple-600" />,
    description: 'General rules and conditions of purchase',
    placeholder: `Example:

By placing an order with us, you agree to the following terms:

1. All prices are in Indian Rupees (₹) and inclusive of applicable taxes.
2. Orders are confirmed only after payment is received.
3. We reserve the right to cancel any order due to stock unavailability.
4. In case of a dispute, we will first try to resolve it amicably.
5. These terms are governed by the laws of India.`,
  },
];

export function LegalPagesSettings() {
  const { store, user, updateStoreSettings } = useStore();
  
  const [editingPage, setEditingPage] = useState<keyof LegalPages | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Derived state from store
  const currentPages = store.legalPages || {};
  const filledCount = LEGAL_PAGES.filter(p => currentPages[p.key]?.trim()).length;

  const handleEdit = (key: keyof LegalPages) => {
    setDraftContent(currentPages[key] || '');
    setEditingPage(key);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    try {
      await updateStoreSettings({ 
        legalPages: { 
          ...currentPages, 
          [editingPage]: draftContent 
        } 
      });
      setEditingPage(null);
    } catch {
      alert('Failed to save page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (key: keyof LegalPages) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await updateStoreSettings({ 
        legalPages: { 
          ...currentPages, 
          [key]: '' 
        } 
      });
    } catch {
      alert('Failed to delete page. Please try again.');
    }
  };

  // ─── Edit View ────────────────────────────────────────────────────────────────
  if (editingPage) {
    const pageObj = LEGAL_PAGES.find(p => p.key === editingPage)!;
    return (
      <div className="space-y-4 pb-6 animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setEditingPage(null)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Legal Pages
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
               {pageObj.icon}
             </div>
             <div>
               <h3 className="text-base font-bold text-gray-900 leading-none mb-1">{pageObj.title}</h3>
               <p className="text-xs text-gray-500 leading-tight">{pageObj.description}</p>
             </div>
          </div>
          
          {/* Editor */}
          <div className="p-4 bg-gray-50/50">
             <textarea
               className="w-full min-h-[300px] text-sm text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400 placeholder:opacity-50 leading-relaxed shadow-sm transition-shadow"
               placeholder={pageObj.placeholder}
               value={draftContent}
               onChange={(e) => setDraftContent(e.target.value)}
             />
             <p className="text-xs text-gray-400 mt-2">
               You can use basic text formatting. Links are not supported yet.
             </p>
          </div>
          
          {/* Footer actions */}
          <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-3 bg-white">
             <button
               onClick={() => setEditingPage(null)}
               className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
             >
               Cancel
             </button>
             <button
               onClick={handleSave}
               disabled={isSaving}
               className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:translate-y-0"
             >
               {isSaving ? 'Saving...' : 'Save changes'}
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── List View ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Legal Pages</p>
          <p className="text-xs text-gray-500 mt-0.5">{filledCount} of {LEGAL_PAGES.length} pages published</p>
        </div>
        {user?.username && (
          <a
            href={`https://${user.username}.myshoplink.site`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview store
          </a>
        )}
      </div>

      {/* List */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {LEGAL_PAGES.map((page, index) => {
          const isFilled = Boolean(currentPages[page.key]?.trim());
          const isLast = index === LEGAL_PAGES.length - 1;

          return (
            <div
              key={page.key}
              className={`flex items-start sm:items-center justify-between p-4 flex-col sm:flex-row gap-4 sm:gap-0 ${
                !isLast ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isFilled ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'
                }`}>
                  {page.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-bold text-gray-900 leading-tight">{page.title}</p>
                    {isFilled && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded pl-1">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-500 leading-tight">{page.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isFilled ? (
                  <>
                    <button
                      onClick={() => handleEdit(page.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors flex-1 sm:flex-none justify-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 flex items-center gap-1.5 transition-colors shrink-0"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(page.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="mt-4 bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3.5 flex items-start gap-3">
        <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-indigo-700 leading-relaxed font-medium">
          These pages are linked in your store footer automatically. Customers can read your policies before placing an order, which builds trust and reduces disputes.
        </p>
      </div>
    </div>
  );
}
