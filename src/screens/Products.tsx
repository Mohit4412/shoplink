'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Edit2, Trash2, FolderPlus, Package, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Product, ProductStatus, Order } from '../types';
import { getCurrencySymbol } from '../utils/currency';

import { ProductTable } from '../components/products/ProductTable';
import { ProductModal } from '../components/products/ProductModal';
import { DeleteProductModal } from '../components/products/DeleteProductModal';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { LogOrderModal } from '../components/dashboard/LogOrderModal';
import { UpgradeModal, useUpgradeModal } from '../components/billing/UpgradeModal';

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct, store, orders, addOrder, updateOrder, deleteOrder, user } = useStore();
  const isPro = user?.plan === 'Pro';
  const FREE_LIMIT = 10;
  const atLimit = !isPro && products.length >= FREE_LIMIT;
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'price'>('name');
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'orders' | 'sales'>(() => {
    if (typeof window === 'undefined') return 'products';
    return (window.localStorage.getItem('productsTab') as 'products' | 'collections' | 'orders' | 'sales') || 'products';
  });

  useEffect(() => {
    window.localStorage.setItem('productsTab', activeTab);
  }, [activeTab]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const upgradeModal = useUpgradeModal();

  const [isLogOrderModalOpen, setIsLogOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const currencySymbol = getCurrencySymbol(store.currency);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    status: 'Active' as ProductStatus,
    images: [] as string[],
    highlights: '',
    collection: '',
  });

  const parseLines = (value: string) =>
    value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.price - b.price;
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizeName = (val: string) => val.trim().replace(/[<>"&]/g, '');
    const cleanName = sanitizeName(formData.name);
    const result = addProduct({
      name: cleanName,
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      status: formData.status,
      imageUrl: formData.images[0] || `https://picsum.photos/seed/${cleanName.replace(/\s+/g, '')}/200/200`,
      images: formData.images.length
        ? formData.images
        : [`https://picsum.photos/seed/${cleanName.replace(/\s+/g, '')}/200/200`],
      category: 'General',
      stock: 10,
      highlights: parseLines(formData.highlights),
      collection: formData.collection || undefined,
      reviews: [],
    });
    if (result === 'LIMIT_REACHED') {
      throw new Error('LIMIT_REACHED');
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const sanitizeName = (val: string) => val.trim().replace(/[<>"&]/g, '');
    updateProduct(selectedProduct.id, {
      name: sanitizeName(formData.name),
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      status: formData.status,
      imageUrl: formData.images[0] || selectedProduct.imageUrl,
      images: formData.images.length ? formData.images : [selectedProduct.imageUrl],
      highlights: parseLines(formData.highlights),
      collection: formData.collection || undefined,
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return;
    deleteProduct(selectedProduct.id);
    setIsDeleteModalOpen(false);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      status: product.status,
      images: product.images?.length ? product.images : [product.imageUrl],
      highlights: (product.highlights ?? []).join('\n'),
      collection: product.collection ?? '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      status: 'Active',
      images: [],
      highlights: '',
      collection: '',
    });
    setSelectedProduct(null);
  };

  const handleSaveOrder = (newOrder: { productId: string; quantity: number; revenue: number; notes: string; date: string }) => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, newOrder);
    } else {
      addOrder({ ...newOrder, status: 'confirmed' });
    }
    setIsLogOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsLogOrderModalOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(order.id);
    }
  };

  const collections = React.useMemo(() => {
    const colMap = new Map<string, number>();
    products.forEach(p => {
      if (p.collection && p.status === 'Active') {
        colMap.set(p.collection, (colMap.get(p.collection) || 0) + 1);
      }
    });
    return Array.from(colMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const [selectedCol, setSelectedCol] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'collections' && collections.length > 0) {
      if (!selectedCol || !collections.find(c => c.name === selectedCol)) {
        setSelectedCol(collections[0].name);
      }
    }
  }, [activeTab, collections, selectedCol]);

  const [renameModal, setRenameModal] = useState<{ open: boolean; oldName: string; value: string }>({ open: false, oldName: '', value: '' });

  const handleRenameCollection = (oldName: string) => {
    setRenameModal({ open: true, oldName, value: oldName });
  };

  const commitRename = () => {
    const { oldName, value } = renameModal;
    if (value.trim() && value.trim() !== oldName) {
      products.forEach(p => {
        if (p.collection === oldName) updateProduct(p.id, { collection: value.trim() });
      });
      if (selectedCol === oldName) setSelectedCol(value.trim());
    }
    setRenameModal({ open: false, oldName: '', value: '' });
  };

  const handleDeleteCollection = (name: string) => {
    if (window.confirm(`Delete collection "${name}"? Products will not be deleted, they will just be unassigned.`)) {
      products.forEach(p => {
        if (p.collection === name) {
          updateProduct(p.id, { collection: '' });
        }
      });
    }
  };

  const handleRemoveFromCollection = (productId: string) => {
    if (window.confirm('Remove this product from the collection?')) {
      updateProduct(productId, { collection: '' });
    }
  };

  const promptNewCollection = () => {
    const name = window.prompt('Enter new collection name:');
    if (name && name.trim()) {
      // Open add product modal exactly bound to this collection
      resetForm();
      setFormData(prev => ({ ...prev, collection: name.trim() }));
      setIsAddModalOpen(true);
    }
  };

  const handleUpgradeRequired = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    upgradeModal.open();
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Title + conditional action button */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your catalog</p>
        </div>
        {activeTab === 'sales' && (
          <button
            onClick={() => { setSelectedOrder(null); setIsLogOrderModalOpen(true); }}
            className="h-9 px-3 bg-gray-900 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 hover:bg-gray-700 transition-colors shrink-0 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Order
          </button>
        )}
      </div>

      {/* Row 2: Search + Sort + Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as 'name' | 'price')}
          className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 shrink-0"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
        <button
          onClick={() => {
            if (atLimit) { setShowLimitBanner(true); return; }
            setShowLimitBanner(false);
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="h-9 w-9 bg-gray-900 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Limit banner */}
      {showLimitBanner && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">Product limit reached</p>
              <p className="text-xs text-amber-700 mt-0.5">Free plan allows up to 10 products. Upgrade to Pro to add unlimited products.</p>
            </div>
          </div>
          <button
            onClick={() => { setShowLimitBanner(false); upgradeModal.open(); }}
            className="shrink-0 ml-3 h-8 px-3 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Upgrade
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {(['products', 'collections', 'orders', 'sales'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'sales' ? 'Sales History' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'products' && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-6">Add your first product and start selling on WhatsApp in minutes.</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Product
              </Button>
            </div>
          ) : (
            <>
              <ProductTable
                products={products}
                filteredProducts={filteredProducts}
                currencySymbol={currencySymbol}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </>
          )}
        </>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-4 pt-1">

          {/* Collections header row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Manage Collections</h2>
              <p className="text-xs text-gray-400 mt-0.5">Organise your products into categories</p>
            </div>
            <button
              onClick={promptNewCollection}
              className="h-9 px-4 bg-gray-900 text-white text-sm rounded-xl flex items-center gap-1.5 hover:bg-gray-700 transition-colors shrink-0"
            >
              <FolderPlus className="w-4 h-4" />
              New Collection
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderPlus className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-400 mt-2">No collections yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first collection to organise your products</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-start">

              {/* Sidebar list */}
              <div className="w-full sm:w-[160px] shrink-0 divide-y divide-gray-50">
                {collections.map((col) => {
                  const isActive = selectedCol === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedCol(col.name)}
                      className={`w-full text-left py-3 px-3 rounded-xl transition-colors ${
                        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className={`text-sm truncate ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {col.name.length > 18 ? col.name.slice(0, 18) + '…' : col.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{col.count} products</p>
                    </button>
                  );
                })}
              </div>

              {/* Detail panel */}
              <div className="flex-1 min-w-0">
                {selectedCol ? (
                  <div>
                    {/* Detail header */}
                    <h3 className="text-xl font-bold text-gray-900 truncate">{selectedCol}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Manage products in this collection</p>

                    {/* Action row */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRenameCollection(selectedCol)}
                        className="h-8 px-3 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(selectedCol)}
                        className="h-8 px-3 text-xs rounded-lg border border-red-100 bg-white text-red-500 flex items-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Products section */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          Products ({products.filter(p => p.collection === selectedCol).length})
                        </p>
                        <button
                          onClick={() => {
                            resetForm();
                            setFormData(prev => ({ ...prev, collection: selectedCol }));
                            setIsAddModalOpen(true);
                          }}
                          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Items
                        </button>
                      </div>

                      <div className="overflow-x-auto flex gap-3 pb-2">
                        {products.filter(p => p.collection === selectedCol).map(p => (
                          <div key={p.id} className="shrink-0 flex flex-col items-center gap-1.5 group relative">
                            <div className="relative">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-[72px] h-[72px] rounded-xl object-cover border border-gray-100"
                              />
                              <button
                                onClick={() => handleRemoveFromCollection(p.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                            <p className="text-xs font-medium text-gray-700 w-[72px] truncate text-center">{currencySymbol}{p.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 pt-4">Select a collection to view details</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="pt-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pending WhatsApp Orders</h2>
              <p className="text-sm text-gray-500">When customers tap "Order on WhatsApp", they appear here for you to confirm.</p>
            </div>
          </div>

          {orders.filter(o => o.status === 'pending').length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No pending orders</p>
              <p className="text-gray-400 mt-1 max-w-sm mx-auto">Orders will automatically show up here when customers initiate a WhatsApp chat.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.filter(o => o.status === 'pending').map(order => {
                const product = products.find(p => p.id === order.productId);
                if (!product) return null;
                return (
                  <div key={order.id} className="bg-white border border-orange-200 shadow-sm rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-100 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Pending</span>
                        <span className="text-xs text-gray-400">{format(new Date(order.date), 'MMM dd, p')}</span>
                      </div>
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 flex gap-4">
                        <span>Qty: {order.quantity}</span>
                        <span className="font-semibold text-gray-700">{currencySymbol}{order.revenue.toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="flex flex-row w-full md:w-auto gap-3 mt-2 md:mt-0 shrink-0">
                      <Button variant="outline" className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateOrder(order.id, { status: 'declined' })}>
                        Decline
                      </Button>
                      <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700" onClick={() => updateOrder(order.id, { status: 'confirmed' })}>
                        Confirm Order
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="pt-1">
          {/* Summary strip */}
          {orders.filter(o => o.status === 'confirmed').length > 0 && (
            <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 mb-4">
              <span className="text-sm text-gray-600">
                {orders.filter(o => o.status === 'confirmed').length} confirmed {orders.filter(o => o.status === 'confirmed').length === 1 ? 'sale' : 'sales'}
              </span>
              <span className="text-base font-bold text-green-700">
                {currencySymbol}{orders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.revenue, 0).toFixed(2)}
              </span>
            </div>
          )}

          <RecentOrdersTable
            orders={orders.filter(o => o.status === 'confirmed')}
            products={products}
            currencySymbol={currencySymbol}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        </div>
      )}

      <ProductModal 
        isOpen={isAddModalOpen || isEditModalOpen}
        isEditMode={isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}
        onUpgradeRequired={handleUpgradeRequired}
        currencySymbol={currencySymbol}
        existingCollections={collections.map(c => c.name)}
      />

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />

      <DeleteProductModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={selectedProduct?.name}
      />

      <LogOrderModal 
        isOpen={isLogOrderModalOpen}
        onClose={() => {
          setIsLogOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        products={products}
        currencySymbol={currencySymbol}
        todayStr={todayStr}
        onSave={handleSaveOrder}
        initialData={selectedOrder}
      />

      {/* Rename Collection Modal */}
      {renameModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setRenameModal({ open: false, oldName: '', value: '' })} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">Rename Collection</h3>
            <input
              autoFocus
              type="text"
              value={renameModal.value}
              onChange={e => setRenameModal(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenameModal({ open: false, oldName: '', value: '' }); }}
              className="h-10 px-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
              placeholder="Collection name"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRenameModal({ open: false, oldName: '', value: '' })}
                className="h-9 px-4 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitRename}
                disabled={!renameModal.value.trim()}
                className="h-9 px-4 text-sm rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
