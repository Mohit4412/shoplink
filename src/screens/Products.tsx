'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, Calendar, ChevronDown, Edit2, Trash2, FolderPlus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Product, ProductStatus, Order } from '../types';
import { getCurrencySymbol } from '../utils/currency';

import { ProductTable } from '../components/products/ProductTable';
import { ProductMobileCards } from '../components/products/ProductMobileCards';
import { ProductModal } from '../components/products/ProductModal';
import { DeleteProductModal } from '../components/products/DeleteProductModal';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { LogOrderModal } from '../components/dashboard/LogOrderModal';
import { UpgradeModal, useUpgradeModal } from '../components/billing/UpgradeModal';

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct, store, orders, addOrder, updateOrder, deleteOrder, notifications, markNotificationRead } = useStore();
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

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
  };

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

  const handleRenameCollection = (oldName: string) => {
    const newName = window.prompt(`Rename collection "${oldName}" to:`, oldName);
    if (newName && newName.trim() !== oldName) {
      products.forEach(p => {
        if (p.collection === oldName) {
          updateProduct(p.id, { collection: newName.trim() });
        }
      });
    }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'products' ? 'Products' : activeTab === 'collections' ? 'Collections' : activeTab === 'orders' ? 'Orders' : 'Sales History'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'products' ? 'Manage your catalog and store inventory' : activeTab === 'collections' ? 'Group your products logically' : activeTab === 'orders' ? 'Track order status' : 'View and manage your recent sales'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'name' | 'price')}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
          <div className="relative hidden sm:block" ref={notificationRef}>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#F8F9FA]"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {(notifications || []).length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    (notifications || []).map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-2 hover:bg-gray-50 rounded-md cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('products')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'products'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'collections'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'orders'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sales'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sales History
          </button>
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
              <div className="hidden md:block">
                <ProductTable
                  products={products}
                  filteredProducts={filteredProducts}
                  currencySymbol={currencySymbol}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              </div>
              <div className="md:hidden">
                <ProductMobileCards
                  filteredProducts={filteredProducts}
                  currencySymbol={currencySymbol}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage Collections</h2>
              <p className="text-sm text-gray-500">Organize your products into logical categories for your customers to browse.</p>
            </div>
            <Button onClick={promptNewCollection}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <FolderPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No collections yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">Create collections to group your products together and make browsing easier for your customers.</p>
              <Button onClick={promptNewCollection}>
                Create your first collection
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
              {/* Sidebar: List of Collections */}
              <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-2">
                {collections.map((col) => {
                  const isActive = selectedCol === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedCol(col.name)}
                      className={`flex items-center justify-between p-4 rounded-xl text-left border transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500/10' 
                          : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <h3 className={`font-semibold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{col.name}</h3>
                        <p className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{col.count} {col.count === 1 ? 'Product' : 'Products'}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-blue-500 translate-x-1' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Detail View */}
              <div className="w-full md:w-2/3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-[400px]">
                {selectedCol ? (
                  <>
                    {/* Detail Header */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight truncate">{selectedCol}</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage products in this collection</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRenameCollection(selectedCol)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Rename
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 text-red-600" onClick={() => handleDeleteCollection(selectedCol)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-900">Products ({products.filter(p => p.collection === selectedCol).length})</h3>
                        <Button size="sm" variant="ghost" className="text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => {
                            resetForm();
                            setFormData(prev => ({ ...prev, collection: selectedCol }));
                            setIsAddModalOpen(true);
                        }}>
                          <Plus className="w-4 h-4 mr-1" /> Add Items
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.filter(p => p.collection === selectedCol).map(p => (
                          <div key={p.id} className="group relative flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-md transition-all">
                            <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50 flex-shrink-0 border border-gray-100" />
                            <div className="flex-1 min-w-0 pr-8">
                              <p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>
                              <p className="text-sm font-semibold text-gray-600 mt-0.5">{currencySymbol}{p.price.toFixed(2)}</p>
                            </div>
                            <button 
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              onClick={() => handleRemoveFromCollection(p.id)}
                              title="Remove from collection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
                     <p>Select a collection to view its details</p>
                  </div>
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
        <div className="pt-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sales History</h2>
              <p className="text-sm text-gray-500">View your confirmed and completed sales records.</p>
            </div>
            <Button 
              variant="outline" 
              className="border-green-600 text-green-700 hover:bg-green-50"
              onClick={() => {
                setSelectedOrder(null);
                setIsLogOrderModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Order
            </Button>
          </div>

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
    </div>
  );
}
