'use client';

import { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Bell, Plus, Edit2, Trash2, FolderPlus, Package, Zap, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
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
import { Modal } from '../components/ui/Modal';
import { UpgradeModal, useUpgradeModal } from '../components/billing/UpgradeModal';
import { formatPaymentMethodLabel, parseOrderLeadNotes } from '../utils/orderLeads';

const COLLECTION_PRODUCTS_PAGE_SIZE = 6;

export function Products() {
  const searchParams = useSearchParams();
  const { products, addProduct, updateProduct, deleteProduct, store, orders, addOrder, updateOrder, deleteOrder, user } = useStore();
  const isPro = user?.plan === 'Pro';
  const FREE_LIMIT = 10;
  const atLimit = !isPro && products.length >= FREE_LIMIT;
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'price'>('name');
  const requestedView = searchParams?.get('view');
  const activeTab = (['products', 'collections', 'orders', 'sales'] as const).includes((requestedView ?? '') as any)
    ? (requestedView as 'products' | 'collections' | 'orders' | 'sales')
    : 'products';
  const sectionMeta = {
    products: {
      title: 'Products',
      subtitle: 'Manage your catalog',
    },
    collections: {
      title: 'Collections',
      subtitle: 'Organize products into curated groups',
    },
    orders: {
      title: 'Orders',
      subtitle: 'Review and manage incoming order requests',
    },
    sales: {
      title: 'Sales History',
      subtitle: 'Track confirmed orders and revenue',
    },
  } as const;
  const currentSection = sectionMeta[activeTab];

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
    variants: [] as import('../types').ProductVariant[],
  });

  const parseLines = (value: string) =>
    value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  const getProductCollections = (product: Product) => product.collections?.length
    ? product.collections
    : product.collection
      ? [product.collection]
      : [];
  const hasCollection = (product: Product, collectionName: string) =>
    getProductCollections(product).includes(collectionName);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.price - b.price;
    }
  });

  const handleAddSubmit = (e: FormEvent) => {
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
      variants: formData.variants.filter(v => v.name.trim() && v.options.length > 0),
      collection: formData.collection || undefined,
      collections: formData.collection ? [formData.collection] : [],
      reviews: [],
    });
    if (result === 'LIMIT_REACHED') {
      throw new Error('LIMIT_REACHED');
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: FormEvent) => {
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
      variants: formData.variants.filter(v => v.name.trim() && v.options.length > 0),
      collection: formData.collection || undefined,
      collections: formData.collection
        ? Array.from(new Set([formData.collection, ...getProductCollections(selectedProduct).filter((collectionName) => collectionName !== selectedProduct.collection)]))
        : getProductCollections(selectedProduct).filter((collectionName) => collectionName !== selectedProduct.collection),
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
      collection: getProductCollections(product)[0] ?? '',
      variants: product.variants ?? [],
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
      variants: [],
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

  const collections = useMemo(() => {
    const colMap = new Map<string, number>();
    products.forEach(p => {
      getProductCollections(p).forEach((collectionName) => {
        if (p.status === 'Active') {
          colMap.set(collectionName, (colMap.get(collectionName) || 0) + 1);
        }
      });
    });
    return Array.from(colMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [collectionProductsPage, setCollectionProductsPage] = useState(1);

  useEffect(() => {
    if (activeTab === 'collections' && collections.length > 0) {
      if (!selectedCol || !collections.find(c => c.name === selectedCol)) {
        setSelectedCol(collections[0].name);
      }
    }
  }, [activeTab, collections, selectedCol]);

  useEffect(() => {
    setCollectionProductsPage(1);
  }, [selectedCol]);

  const selectedCollectionProducts = useMemo(
    () => products.filter((product) => selectedCol ? hasCollection(product, selectedCol) : false),
    [products, selectedCol]
  );
  const collectionProductsTotalPages = Math.max(
    1,
    Math.ceil(selectedCollectionProducts.length / COLLECTION_PRODUCTS_PAGE_SIZE)
  );
  const currentCollectionProductsPage = Math.min(collectionProductsPage, collectionProductsTotalPages);
  const paginatedCollectionProducts = selectedCollectionProducts.slice(
    (currentCollectionProductsPage - 1) * COLLECTION_PRODUCTS_PAGE_SIZE,
    currentCollectionProductsPage * COLLECTION_PRODUCTS_PAGE_SIZE
  );

  const [renameModal, setRenameModal] = useState<{ open: boolean; oldName: string; value: string }>({ open: false, oldName: '', value: '' });
  const [createCollectionModal, setCreateCollectionModal] = useState({ open: false, value: '', error: '' });
  const [attachProductsModalOpen, setAttachProductsModalOpen] = useState(false);
  const [collectionAssignProduct, setCollectionAssignProduct] = useState<Product | null>(null);

  const handleRenameCollection = (oldName: string) => {
    setRenameModal({ open: true, oldName, value: oldName });
  };

  const commitRename = () => {
    const { oldName, value } = renameModal;
    if (value.trim() && value.trim() !== oldName) {
      products.forEach(p => {
        if (hasCollection(p, oldName)) {
          const nextCollections = getProductCollections(p).map((collectionName) => (
            collectionName === oldName ? value.trim() : collectionName
          ));
          updateProduct(p.id, {
            collection: nextCollections[0] || undefined,
            collections: nextCollections,
          });
        }
      });
      if (selectedCol === oldName) setSelectedCol(value.trim());
    }
    setRenameModal({ open: false, oldName: '', value: '' });
  };

  const handleDeleteCollection = (name: string) => {
    if (window.confirm(`Delete collection "${name}"? Products will not be deleted, they will just be unassigned.`)) {
      products.forEach(p => {
        if (hasCollection(p, name)) {
          const nextCollections = getProductCollections(p).filter((collectionName) => collectionName !== name);
          updateProduct(p.id, {
            collection: nextCollections[0] || undefined,
            collections: nextCollections,
          });
        }
      });
    }
  };

  const handleRemoveFromCollection = (productId: string) => {
    if (window.confirm('Remove this product from the collection?')) {
      const product = products.find((item) => item.id === productId);
      if (!product || !selectedCol) return;
      const nextCollections = getProductCollections(product).filter((collectionName) => collectionName !== selectedCol);
      updateProduct(productId, {
        collection: nextCollections[0] || undefined,
        collections: nextCollections,
      });
    }
  };

  const promptNewCollection = () => {
    setCreateCollectionModal({ open: true, value: '', error: '' });
  };

  const handleAssignCollection = (product: Product, collection: string) => {
    const currentCollections = getProductCollections(product);
    const nextCollections = collection
      ? Array.from(new Set([...currentCollections, collection]))
      : [];
    updateProduct(product.id, {
      collection: nextCollections[0] || undefined,
      collections: nextCollections,
    });
    setCollectionAssignProduct((prev) => (
      prev?.id === product.id
        ? {
            ...prev,
            collection: nextCollections[0] || undefined,
            collections: nextCollections,
          }
        : prev
    ));
  };

  const handleToggleCollection = (product: Product, collection: string) => {
    const currentCollections = getProductCollections(product);
    const nextCollections = currentCollections.includes(collection)
      ? currentCollections.filter((collectionName) => collectionName !== collection)
      : [...currentCollections, collection];
    updateProduct(product.id, {
      collection: nextCollections[0] || undefined,
      collections: nextCollections,
    });
    setCollectionAssignProduct((prev) => (
      prev?.id === product.id
        ? {
            ...prev,
            collection: nextCollections[0] || undefined,
            collections: nextCollections,
          }
        : prev
    ));
  };

  const openCollectionManager = (product: Product) => {
    setCollectionAssignProduct(product);
  };

  const commitCreateCollection = () => {
    const collectionName = createCollectionModal.value.trim();

    if (!collectionName) {
      setCreateCollectionModal((prev) => ({ ...prev, error: 'Please enter a collection name.' }));
      return;
    }

    if (collections.some((collection) => collection.name.toLowerCase() === collectionName.toLowerCase())) {
      setCreateCollectionModal((prev) => ({ ...prev, error: 'A collection with this name already exists.' }));
      return;
    }

    setCreateCollectionModal({ open: false, value: '', error: '' });
    setSelectedCol(collectionName);
    resetForm();
    setFormData((prev) => ({ ...prev, collection: collectionName }));
    setIsAddModalOpen(true);
  };

  const handleUpgradeRequired = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    upgradeModal.open();
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Title + conditional action button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{currentSection.subtitle}</p>
        </div>
        {activeTab === 'sales' && (
          <button
            onClick={() => { setSelectedOrder(null); setIsLogOrderModalOpen(true); }}
            className="h-9 px-3 bg-gray-900 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 hover:bg-gray-700 transition-colors shrink-0 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Order Manually
          </button>
        )}
      </div>

      {/* Row 2: Search + Sort + Add */}
      {activeTab === 'products' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
            className="flex flex-1 flex-row items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              (event.currentTarget.querySelector('input') as HTMLInputElement | null)?.blur();
            }}
          >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Search
                </button>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as 'name' | 'price')}
                  className="h-10 min-w-[120px] px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="name">Sort: Name</option>
                  <option value="price">Sort: Price</option>
                </select>
              </div>
            </form>
            <button
              onClick={() => {
                if (atLimit) { setShowLimitBanner(true); return; }
                setShowLimitBanner(false);
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-700 lg:h-10 lg:w-auto lg:px-3.5 lg:text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      )}

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
                username={user?.username ?? ''}
                onManageCollection={openCollectionManager}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </>
          )}
        </>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-4 pt-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Collections</h2>
                <p className="mt-1 text-sm text-gray-500">Organize products into groups that are easy to manage and show on your storefront.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {products.filter((product) => getProductCollections(product).length > 0).length} assigned
                </div>
                <button
                  onClick={promptNewCollection}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Collection
                </button>
              </div>
            </div>

            {collections.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                  <FolderPlus className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No collections yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  Create collections for categories like New Arrivals, Best Sellers, or Festive Specials.
                </p>
              </div>
            ) : (
              <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="border-b border-gray-100 md:border-b-0 md:border-r">
                  <div className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    All Collections
                  </div>
                  <div className="divide-y divide-gray-100">
                    {collections.map((col) => {
                      const isActive = selectedCol === col.name;
                      return (
                        <button
                          key={col.name}
                          onClick={() => setSelectedCol(col.name)}
                          className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                            isActive ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{col.name}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {col.count} {col.count === 1 ? 'product' : 'products'}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {col.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-w-0 px-5 py-5">
                  {selectedCol ? (
                    <>
                      <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{selectedCol}</h3>
                          <p className="mt-1 text-sm text-gray-500">Products grouped under this collection.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setAttachProductsModalOpen(true)}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Package className="h-4 w-4" />
                            Add Existing
                          </button>
                          <button
                            onClick={() => {
                              resetForm();
                              setFormData(prev => ({ ...prev, collection: selectedCol }));
                              setIsAddModalOpen(true);
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gray-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                          >
                            <Plus className="h-4 w-4" />
                            Add Product
                          </button>
                          <button
                            onClick={() => handleRenameCollection(selectedCol)}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Edit2 className="h-4 w-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(selectedCol)}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 px-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Total Products</p>
                          <p className="mt-2 text-xl font-semibold text-gray-900">{selectedCollectionProducts.length}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Active</p>
                          <p className="mt-2 text-xl font-semibold text-gray-900">
                            {selectedCollectionProducts.filter((p) => p.status === 'Active').length}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Inactive</p>
                          <p className="mt-2 text-xl font-semibold text-gray-900">
                            {selectedCollectionProducts.filter((p) => p.status !== 'Active').length}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                        {selectedCollectionProducts.length === 0 ? (
                          <div className="bg-gray-50 px-5 py-12 text-center">
                            <Package className="mx-auto h-9 w-9 text-gray-300" />
                            <p className="mt-3 text-sm font-medium text-gray-700">No products in this collection</p>
                            <p className="mt-1 text-sm text-gray-500">Add products to make this collection visible and useful.</p>
                          </div>
                        ) : (
                          <div className="flex h-[420px] flex-col">
                            <div className="flex-1 overflow-x-auto overflow-y-auto">
                              <table className="min-w-[720px] w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr className="border-b border-gray-200">
                                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Product</th>
                                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Status</th>
                                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Price</th>
                                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {paginatedCollectionProducts.map((p) => (
                                  <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <img
                                          src={p.imageUrl}
                                          alt={p.name}
                                          className="h-12 w-12 rounded-xl border border-gray-100 object-cover"
                                        />
                                        <div className="min-w-0">
                                          <p className="truncate font-medium text-gray-900">{p.name}</p>
                                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                                            {p.description || 'No description added'}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {p.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{currencySymbol}{p.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => handleRemoveFromCollection(p.id)}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                              <span className="text-xs text-gray-500">
                                {(currentCollectionProductsPage - 1) * COLLECTION_PRODUCTS_PAGE_SIZE + 1}
                                –
                                {Math.min(currentCollectionProductsPage * COLLECTION_PRODUCTS_PAGE_SIZE, selectedCollectionProducts.length)} of {selectedCollectionProducts.length}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setCollectionProductsPage((page) => Math.max(1, page - 1))}
                                  disabled={currentCollectionProductsPage === 1}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCollectionProductsPage((page) => Math.min(collectionProductsTotalPages, page + 1))}
                                  disabled={currentCollectionProductsPage === collectionProductsTotalPages}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                      <div>
                        <FolderPlus className="mx-auto h-9 w-9 text-gray-300" />
                        <p className="mt-3 text-sm font-semibold text-gray-700">Select a collection</p>
                        <p className="mt-1 text-sm text-gray-500">Choose a collection from the left to manage it.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="pt-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pending Order Requests</h2>
              <p className="text-sm text-gray-500">When customers place an order request from your store, it appears here for you to confirm.</p>
            </div>
          </div>

          {orders.filter(o => o.status === 'pending').length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No pending orders</p>
              <p className="text-gray-400 mt-1 max-w-sm mx-auto">Orders will automatically show up here when customers submit a request from your store.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {orders.filter(o => o.status === 'pending').map(order => {
                  const product = products.find(p => p.id === order.productId);
                  const lead = parseOrderLeadNotes(order.notes);
                  return (
                    <div key={order.id} className="rounded-2xl border border-orange-200 bg-white overflow-hidden shadow-sm">
                      <div className="flex items-start gap-3 p-3">
                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-orange-50">
                          {product?.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-orange-100" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                              {product?.name || 'Unknown product'}
                            </p>
                            <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                              Pending
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {currencySymbol}{order.revenue.toFixed(2)}
                            <span className="ml-1.5 text-xs font-normal text-gray-400">× {order.quantity}</span>
                          </p>
                          <p className="mt-1 text-xs font-medium text-gray-700">
                            {lead.details.customerName || 'No name'}
                            {lead.details.customerPhone && (
                              <span className="font-normal text-gray-400"> · {lead.details.customerPhone}</span>
                            )}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            {formatPaymentMethodLabel(lead.details.paymentMethod) || 'Payment not specified'}
                            {' · '}{format(new Date(order.date), 'MMM d, h:mm a')}
                          </p>
                          {(lead.details.address || lead.details.email) && (
                            <div className="mt-1.5 space-y-0.5">
                              {lead.details.address && (
                                <p className="text-[11px] text-gray-500 leading-snug">
                                  📍 {lead.details.address}{lead.details.pincode ? ` — ${lead.details.pincode}` : ''}
                                </p>
                              )}
                              {lead.details.email && (
                                <p className="text-[11px] text-gray-400">✉ {lead.details.email}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex border-t border-orange-100">
                        <button
                          onClick={() => updateOrder(order.id, { status: 'declined' })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-r border-orange-100"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                        <button
                          onClick={() => updateOrder(order.id, { status: 'confirmed' })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-green-700 hover:bg-green-50 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-orange-200 bg-white shadow-sm">
                <table className="min-w-[920px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-100 bg-orange-50/60">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Product</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">Quantity</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Phone Number</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Preferred Payment</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Shipping</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === 'pending').map(order => {
                      const product = products.find(p => p.id === order.productId);
                      const lead = parseOrderLeadNotes(order.notes);
                      if (!product) return null;
                      return (
                        <tr key={order.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">{currencySymbol}{order.revenue.toFixed(2)} · {format(new Date(order.date), 'MMM dd, p')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700">{order.quantity}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-800">{order.status}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{lead.details.customerName || 'Not provided'}</td>
                          <td className="px-4 py-3 text-gray-600">
                            <div>
                              <p>{lead.details.customerPhone || 'Not provided'}</p>
                              {lead.details.email && (
                                <p className="text-[11px] text-gray-400 mt-0.5">{lead.details.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatPaymentMethodLabel(lead.details.paymentMethod) || 'Not provided'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px]">
                            {lead.details.address ? (
                              <div>
                                <p className="leading-snug">{lead.details.address}</p>
                                {(lead.details.pincode || lead.details.city) && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    {[lead.details.city, lead.details.pincode].filter(Boolean).join(' — ')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateOrder(order.id, { status: 'declined' })}>Decline</Button>
                              <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateOrder(order.id, { status: 'confirmed' })}>Confirm</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="pt-1">
          <RecentOrdersTable
            orders={orders.filter(o => o.status === 'confirmed' || o.status === 'paid')}
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

      <Modal
        isOpen={createCollectionModal.open}
        onClose={() => setCreateCollectionModal({ open: false, value: '', error: '' })}
        title="Create Collection"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Name your collection first. After that, you can add products into it right away.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="collection-name" className="block text-sm font-medium text-gray-700">
              Collection name
            </label>
            <input
              id="collection-name"
              autoFocus
              type="text"
              value={createCollectionModal.value}
              onChange={(event) =>
                setCreateCollectionModal((prev) => ({
                  ...prev,
                  value: event.target.value,
                  error: '',
                }))
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitCreateCollection();
                }
              }}
              placeholder="Festive Specials"
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400"
            />
            {createCollectionModal.error && (
              <p className="text-sm text-red-600">{createCollectionModal.error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateCollectionModal({ open: false, value: '', error: '' })}
              className="inline-flex h-10 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commitCreateCollection}
              className="inline-flex h-10 items-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={attachProductsModalOpen}
        onClose={() => setAttachProductsModalOpen(false)}
        title={selectedCol ? `Add Products to ${selectedCol}` : 'Add Products to Collection'}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose from your existing products and add them to this collection instantly.
          </p>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            {products.filter((product) => !selectedCol || !hasCollection(product, selectedCol)).length === 0 ? (
              <div className="px-5 py-12 text-center bg-gray-50">
                <Package className="mx-auto h-9 w-9 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-700">No more products available</p>
                <p className="mt-1 text-sm text-gray-500">All of your current products are already in this collection.</p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Product</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Current Collection</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Price</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {products
                      .filter((product) => !selectedCol || !hasCollection(product, selectedCol))
                      .map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-11 w-11 rounded-xl border border-gray-100 object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-gray-900">{product.name}</p>
                                <p className="mt-0.5 text-xs text-gray-500">{product.description || 'No description added'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getProductCollections(product).length > 0 ? getProductCollections(product).join(', ') : <span className="text-gray-300">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">{currencySymbol}{product.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleAssignCollection(product, selectedCol ?? '')}
                              className="inline-flex h-8 items-center rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
                            >
                              Add to Collection
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(collectionAssignProduct)}
        onClose={() => setCollectionAssignProduct(null)}
        title={collectionAssignProduct ? `Manage Collection for ${collectionAssignProduct.name}` : 'Manage Collection'}
        className="max-w-lg"
      >
        {collectionAssignProduct && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Current collections</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {getProductCollections(collectionAssignProduct).length > 0 ? getProductCollections(collectionAssignProduct).join(', ') : 'No collection assigned'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Toggle collection membership</p>
              <div className="grid gap-2">
                {collections.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                    Create a collection first to organize this product.
                  </div>
                ) : (
                  collections.map((collection) => {
                    const active = hasCollection(collectionAssignProduct, collection.name);
                    return (
                      <button
                        key={collection.name}
                        type="button"
                        onClick={() => {
                          handleToggleCollection(collectionAssignProduct, collection.name);
                        }}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                          active
                            ? 'border-[#059669] bg-emerald-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{collection.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{collection.count} {collection.count === 1 ? 'product' : 'products'}</p>
                        </div>
                        {active && (
                          <span className="rounded-full bg-[#059669] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  updateProduct(collectionAssignProduct.id, {
                    collection: undefined,
                    collections: [],
                  });
                  setCollectionAssignProduct(null);
                }}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Remove from collection
              </button>
              <button
                type="button"
                onClick={() => setCollectionAssignProduct(null)}
                className="inline-flex h-10 items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

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
