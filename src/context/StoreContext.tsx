'use client';

import React, { createContext, useContext, useState, useRef, ReactNode, useCallback, useMemo } from 'react';
import { AppState, Order, Product, ProductStatus, AppNotification, UserProfile } from '../types';
import { getDefaultAppState, normalizeProduct } from '../lib/default-state';

const VERSION = 4;

export const getInitialState = (): AppState => getDefaultAppState();

interface StoreContextType extends AppState {
  hydrated: boolean;
  refreshUser: () => Promise<void>;
  login: (user: UserProfile) => void;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => 'LIMIT_REACHED' | void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateStoreSettings: (settings: Partial<AppState['store']>) => Promise<void>;
  updateUserProfile: (profile: Partial<AppState['user']>) => Promise<void>;
  trackStoreView: (username?: string) => void;
  trackWhatsAppClick: (productId?: string, username?: string) => void;
  addNotification: (noti: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function getAnalyticsMetadata() {
  if (typeof window === 'undefined') {
    return { source: 'direct', referrerHost: 'direct', pagePath: '/' };
  }

  const search = new URLSearchParams(window.location.search);
  const explicitSource = search.get('utm_source')?.trim().toLowerCase();
  let referrer: URL | null = null;
  try {
    referrer = document.referrer ? new URL(document.referrer) : null;
  } catch {
    referrer = null;
  }
  return {
    source: explicitSource || referrer?.hostname || 'direct',
    referrerHost: referrer?.hostname || 'direct',
    pagePath: window.location.pathname,
  };
}

const loadStoredState = (initialUser: UserProfile | null): AppState => {
  const initialState = getInitialState();
  try {
    const saved = window.localStorage.getItem('myshoplink-state-v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Schema version check — clear stale/corrupt data from old versions
      if (parsed.version !== VERSION) {
        window.localStorage.removeItem('myshoplink-state-v2');
        return {
          ...initialState,
          user: initialUser,
        };
      }
      // Force reset if state is old (missing orders in dailyStats)
      if (parsed.analytics?.dailyStats?.[0] && !('orders' in parsed.analytics.dailyStats[0])) {
        return {
          ...initialState,
          user: initialUser,
        };
      }
      if (
        !Array.isArray(parsed.analytics?.sourceSummary) ||
        !Array.isArray(parsed.analytics?.referrerSummary) ||
        !Array.isArray(parsed.analytics?.countrySummary)
      ) {
        return {
          ...initialState,
          user: initialUser,
        };
      }
      return {
        ...initialState,
        ...parsed,
        user: initialUser,
        products: (parsed.products ?? initialState.products).map(normalizeProduct),
        store: {
          ...initialState.store,
          ...parsed.store,
        },
      };
    }
  } catch (e) {
    console.error('Failed to load state from local storage', e);
  }
  return {
    ...initialState,
    user: initialUser,
  };
};

export const StoreProvider: React.FC<{ children: ReactNode; initialUser: UserProfile | null }> = ({ children, initialUser }) => {
  const [state, setState] = useState<AppState>(() => ({
    ...getInitialState(),
    user: initialUser,
  }));
  const [hydrated, setHydrated] = useState(false);
  // Rate-limit map: productId → last click timestamp (ms)
  const lastClickRef = useRef<Map<string, number>>(new Map());

  const mergeMerchantBundle = useCallback((bundle: { user: AppState['user']; store: AppState['store']; products: AppState['products'] }) => {
    setState(prev => ({
      ...prev,
      user: bundle.user ? { ...(prev.user ?? getInitialState().user!), ...bundle.user } : prev.user,
      store: {
        ...prev.store,
        ...bundle.store,
      },
      products: bundle.products.map(normalizeProduct),
    }));
  }, []);

  const mergeDashboardData = useCallback((dashboard: { orders?: AppState['orders']; analytics?: AppState['analytics'] }) => {
    setState(prev => ({
      ...prev,
      orders: dashboard.orders ?? prev.orders,
      analytics: dashboard.analytics ?? prev.analytics,
    }));
  }, []);

  const persistMerchantBundle = useCallback(async (snapshot: AppState) => {
    if (!snapshot.user?.username) {
      return;
    }

    await fetch(`/api/stores/${snapshot.user.username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: snapshot.user,
        store: snapshot.store,
        products: snapshot.products,
      }),
    });
  }, []);

  const syncMerchantBundle = useCallback(async (snapshot: AppState) => {
    if (!snapshot.user?.username) {
      return;
    }

    try {
      let response = await fetch(`/api/stores/${snapshot.user.username}`, {
        cache: 'no-store',
      });

      if (response.status === 404) {
        await persistMerchantBundle(snapshot);
        response = await fetch(`/api/stores/${snapshot.user.username}`, {
          cache: 'no-store',
        });
      }

      if (!response.ok) {
        return;
      }

      const bundle = await response.json();
      mergeMerchantBundle(bundle);
    } catch (error) {
      console.error('Failed to sync merchant bundle', error);
    }
  }, [mergeMerchantBundle, persistMerchantBundle]);

  const syncDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard', {
        cache: 'no-store',
      });
      if (!response.ok) {
        return;
      }
      const dashboard = await response.json();
      mergeDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to sync dashboard data', error);
    }
  }, [mergeDashboardData]);

  React.useEffect(() => {
    setState(loadStoredState(initialUser));
    setHydrated(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'myshoplink-state-v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(prev => {
            const currentInitialState = getInitialState();
            // Only update if the new state looks valid and is different 
            // from current state to prevent infinite loops
            return JSON.stringify(prev) !== e.newValue ? {
               ...currentInitialState,
               ...parsed,
               user: initialUser,
               products: (parsed.products ?? currentInitialState.products).map(normalizeProduct),
               store: { ...currentInitialState.store, ...parsed.store }
            } : prev;
          });
        } catch (err) {
          console.error(err);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initialUser]);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    const stateWithVersion = { ...state, version: VERSION };
    const currentState = JSON.stringify(stateWithVersion);
    if (window.localStorage.getItem('myshoplink-state-v2') !== currentState) {
      window.localStorage.setItem('myshoplink-state-v2', currentState);
    }
  }, [hydrated, state]);

  React.useEffect(() => {
    if (!hydrated || !state.user?.username) {
      return;
    }

    void syncMerchantBundle(state);
    void syncDashboardData();
  }, [hydrated, state.user?.username, syncDashboardData, syncMerchantBundle]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await res.json();
      if (data?.user) {
        setState(prev => ({ ...prev, user: data.user }));
      }
    } catch { /* ignore */ }
  }, []);

  const login = useCallback((user: UserProfile) => {
    setState(prev => ({
      ...prev,
      user,
    }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, user: null }));
    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      if (typeof window !== 'undefined') {
        window.location.assign('/signup');
      }
    });
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    if (state.user?.plan === 'Free' && state.products.length >= 10) {
      return 'LIMIT_REACHED';
    }

    const newProduct: Product = {
      ...product,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, products: [...prev.products, normalizeProduct(newProduct)] }));
    if (state.user?.username) {
      void fetch(`/api/stores/${state.user.username}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: newProduct }),
      });
    }
  }, [state.products.length, state.user?.plan, state.user?.username]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? normalizeProduct({ ...p, ...updates }) : p),
    }));
    if (state.user?.username) {
      void fetch(`/api/stores/${state.user.username}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updates }),
      });
    }
  }, [state.user?.username]);

  const deleteProduct = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
    if (state.user?.username) {
      void fetch(`/api/stores/${state.user.username}/products/${id}`, {
        method: 'DELETE',
      });
    }
  }, [state.user?.username]);

  const addOrder = useCallback((order: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...order,
      id: `o${Date.now()}`,
      date: order.date || new Date().toISOString(),
    };
    setState(prev => ({ ...prev, orders: [...prev.orders, newOrder] }));
    void fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (payload?.orders) {
          mergeDashboardData({ orders: payload.orders });
          void syncDashboardData();
        }
      });
  }, [mergeDashboardData, syncDashboardData]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === id ? { ...o, ...updates } : o),
    }));
    void fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: updates }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (payload?.orders) {
          mergeDashboardData({ orders: payload.orders });
          void syncDashboardData();
        }
      });
  }, [mergeDashboardData, syncDashboardData]);

  const deleteOrder = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.filter(o => o.id !== id),
    }));
    void fetch(`/api/orders/${id}`, {
      method: 'DELETE',
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (payload?.orders) {
          mergeDashboardData({ orders: payload.orders });
          void syncDashboardData();
        }
      });
  }, [mergeDashboardData, syncDashboardData]);

  const updateStoreSettings = useCallback(async (settings: Partial<AppState['store']>) => {
    if (!state.user?.username) {
      throw new Error('You must be signed in to update store settings.');
    }

    const response = await fetch(`/api/stores/${state.user.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store: settings }),
      });

    const payload = await response.json();
    if (!response.ok || !payload?.store) {
      throw new Error(payload?.error || 'Unable to update store settings.');
    }

    setState(prev => ({
      ...prev,
      store: {
        ...prev.store,
        ...payload.store,
      },
    }));
  }, [state.user?.username]);


  const updateUserProfile = useCallback(async (profile: Partial<AppState['user']>) => {
    const currentUser = state.user;
    if (!currentUser) {
      throw new Error('You must be signed in to update your profile.');
    }

    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          username: profile.username,
          firstName: profile.firstName ?? currentUser.firstName,
          lastName: profile.lastName ?? currentUser.lastName,
          bio: profile.bio ?? currentUser.bio,
          whatsappNumber: profile.whatsappNumber ?? currentUser.whatsappNumber,
          avatarUrl: profile.avatarUrl ?? currentUser.avatarUrl,
          plan: profile.plan ?? currentUser.plan,
          subscriptionRenewalDate: profile.subscriptionRenewalDate ?? currentUser.subscriptionRenewalDate,
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload?.user) {
      throw new Error(payload?.error || 'Unable to update profile');
    }

    setState((prev) => {
      const nextState = { ...prev, user: payload.user };
      queueMicrotask(() => {
        void persistMerchantBundle(nextState);
      });
      return nextState;
    });
  }, [persistMerchantBundle, state.user]);

  const addNotification = useCallback((noti: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    setState(prev => ({
      ...prev,
      notifications: [{
        ...noti,
        id: `n${Date.now()}`,
        date: new Date().toISOString(),
        read: false,
      }, ...(prev.notifications || [])]
    }));
  }, []);

  const trackStoreView = useCallback((username?: string) => {
    const targetUsername = username ?? state.user?.username;
    if (!targetUsername) {
      return;
    }
    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: targetUsername, type: 'view', ...getAnalyticsMetadata() }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (payload?.analytics) {
          mergeDashboardData({ analytics: payload.analytics });
        }
      });
  }, [mergeDashboardData, state.user?.username]);

  const trackWhatsAppClick = useCallback((productId?: string, username?: string) => {
    const targetUsername = username ?? state.user?.username;
    if (!targetUsername) {
      return;
    }
    if (productId) {
      const now = Date.now();
      const lastClick = lastClickRef.current.get(productId) ?? 0;
      if (now - lastClick < 30_000) {
        return;
      }
      lastClickRef.current.set(productId, now);
    }
    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: targetUsername, type: 'click', ...getAnalyticsMetadata() }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (payload?.analytics) {
          mergeDashboardData({ analytics: payload.analytics });
        }
        if (productId) {
          const product = state.products.find((item) => item.id === productId);
          if (product) {
            addNotification({
              title: 'New WhatsApp Inquiry',
              message: `Customer tapped WhatsApp for ${product.name}.`,
            });
          }
        }
      });
  }, [addNotification, mergeDashboardData, state.products, state.user?.username]);

  const markNotificationRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);


  const devForcePlan = process.env.NEXT_PUBLIC_DEV_FORCE_PLAN as 'Free' | 'Pro' | undefined;

  const contextValue = useMemo(() => {
    const base = { hydrated, ...state, refreshUser, login, logout, addProduct, updateProduct, deleteProduct, addOrder, updateOrder, deleteOrder, updateStoreSettings, updateUserProfile, trackStoreView, trackWhatsAppClick, addNotification, markNotificationRead, markAllNotificationsRead, clearAllNotifications };
    if (devForcePlan && base.user) {
      return { ...base, user: { ...base.user, plan: devForcePlan, subscriptionRenewalDate: devForcePlan === 'Free' ? '' : base.user.subscriptionRenewalDate } };
    }
    return base;
  }, [hydrated, state, refreshUser, login, logout, addProduct, updateProduct, deleteProduct, addOrder, updateOrder, deleteOrder, updateStoreSettings, updateUserProfile, trackStoreView, trackWhatsAppClick, addNotification, markNotificationRead, markAllNotificationsRead, clearAllNotifications, devForcePlan]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
