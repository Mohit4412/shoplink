'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bell, LayoutDashboard, Package, BarChart3, Settings,
  ExternalLink, CheckCheck, Trash2, X, LogOut, User,
  ChevronRight, ChevronLeft, ChevronDown, Palette,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatDistanceToNow } from 'date-fns';
import { AppLogo } from '../ui/AppLogo';
import { getStoreUrl } from '../../utils/storeUrl';
import { RenewalBanner } from '../billing/RenewalBanner';

interface AppShellProps {
  children: ReactNode;
  headerVariant?: 'main' | 'back';
  pageTitle?: string;
  pageSubtitle?: string;
  headerRight?: ReactNode;
  userInitials?: string;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', exact: true },
  {
    icon: Package,
    label: 'Products',
    path: '/products',
    exact: false,
    children: [
      { label: 'Products', path: '/products?view=products', view: 'products' },
      { label: 'Collections', path: '/products?view=collections', view: 'collections' },
      { label: 'Orders', path: '/products?view=orders', view: 'orders' },
      { label: 'Sales History', path: '/products?view=sales', view: 'sales' },
      { label: 'Customers', path: '/products?view=customers', view: 'customers' },
    ],
  },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', exact: false },
  { icon: Palette, label: 'Theme', path: '/theme', exact: false },
  {
    icon: Settings,
    label: 'Settings',
    path: '/settings',
    exact: false,
    children: [
      { label: 'Store', path: '/settings?view=store', view: 'store' },
      { label: 'Payments', path: '/settings?view=payments', view: 'payments' },
      { label: 'Custom Domain', path: '/settings?view=domain', view: 'domain' },
      { label: 'Legal Pages', path: '/settings?view=legal', view: 'legal' },
      { label: 'Plans & Billing', path: '/settings?view=billing', view: 'billing' },
    ],
  },
];

export function AppShell({
  children,
  headerVariant = 'main',
  pageTitle,
  pageSubtitle,
  headerRight,
  userInitials = 'U',
}: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notifications, user, markNotificationRead, markAllNotificationsRead, clearAllNotifications, logout } = useStore();
  const notifs = notifications || [];
  const unreadCount = notifs.filter(n => !n.read).length;

  const [notifOpen, setNotifOpen] = useState(false);
  const [desktopProfileOpen, setDesktopProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(pathname.startsWith('/products'));
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(pathname.startsWith('/settings'));
  const notifRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const desktopSidebarRef = useRef<HTMLElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const desktopProfileRef = useRef<HTMLDivElement>(null);
  const desktopAvatarRef = useRef<HTMLButtonElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const mobileAvatarRef = useRef<HTMLButtonElement>(null);

  const toggleNotif = () => {
    setNotifOpen(v => !v);
    setDesktopProfileOpen(false);
    setMobileProfileOpen(false);
  };
  const toggleDesktopProfile = () => {
    setDesktopProfileOpen(v => !v);
    setMobileProfileOpen(false);
    setNotifOpen(false);
  };
  const toggleMobileProfile = () => {
    setMobileProfileOpen(v => !v);
    setDesktopProfileOpen(false);
    setNotifOpen(false);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t) && bellRef.current && !bellRef.current.contains(t)) setNotifOpen(false);
      const clickedInsideSidebar = desktopSidebarRef.current?.contains(t) ?? false;
      if (!clickedInsideSidebar && productsMenuRef.current && !productsMenuRef.current.contains(t)) {
        setProductsMenuOpen(false);
      }
      if (!clickedInsideSidebar && settingsMenuRef.current && !settingsMenuRef.current.contains(t)) {
        setSettingsMenuOpen(false);
      }
      if (
        desktopProfileRef.current &&
        !desktopProfileRef.current.contains(t) &&
        desktopAvatarRef.current &&
        !desktopAvatarRef.current.contains(t)
      ) {
        setDesktopProfileOpen(false);
      }
      if (
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(t) &&
        mobileAvatarRef.current &&
        !mobileAvatarRef.current.contains(t)
      ) {
        setMobileProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setProductsMenuOpen(pathname.startsWith('/products'));
    setSettingsMenuOpen(pathname.startsWith('/settings'));
  }, [pathname]);

  const handleLogout = () => {
    setDesktopProfileOpen(false);
    setMobileProfileOpen(false);
    if (window.confirm('Are you sure you want to log out?')) logout();
  };

  const handleBack = () => {
    if (pathname.includes('/settings')) router.push('/settings');
    else router.back();
  };

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);
  const activeProductsView = searchParams?.get('view') ?? '';
  const activeSettingsView = searchParams?.get('view') ?? '';
  const productsNavItem = NAV_ITEMS.find((item) => item.path === '/products');
  const settingsNavItem = NAV_ITEMS.find((item) => item.path === '/settings');
  const activeNavLabel = pathname.startsWith('/products')
    ? productsNavItem?.children?.find((child) => child.view === activeProductsView)?.label ?? productsNavItem?.label ?? ''
    : pathname.startsWith('/settings')
      ? settingsNavItem?.children?.find((child) => child.view === activeSettingsView)?.label ?? settingsNavItem?.label ?? ''
      : NAV_ITEMS.find((item) => isActive(item))?.label ?? '';
  const isFullWidthPage = pathname === '/dashboard';

  const avatarContent = user?.avatarUrl
    ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
    : <span className="text-sm font-bold">{userInitials}</span>;

  return (
    <div className="min-h-screen bg-[var(--app-canvas)] font-sans flex">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        ref={desktopSidebarRef}
        className="hidden md:flex flex-col w-[220px] shrink-0 fixed top-14 left-0 h-[calc(100vh-56px)] bg-[var(--app-sidebar)] border-r z-20"
        style={{ borderColor: 'var(--app-border)' }}
      >
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const isSettingsItem = item.path === '/settings';
            const isProductsItem = item.path === '/products';
            const showChildren = Boolean(item.children?.length) && (
              isSettingsItem ? settingsMenuOpen : isProductsItem ? productsMenuOpen : active
            );
            return (
              <div
                key={item.path}
                className="group"
                ref={isProductsItem ? productsMenuRef : isSettingsItem ? settingsMenuRef : undefined}
              >
                <div
                  className={`mb-0.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  active
                      ? 'bg-[var(--app-panel)] text-[var(--app-text)] shadow-[inset_0_0_0_1px_var(--app-border)]'
                      : 'text-[var(--app-text-muted)] hover:bg-white/55 hover:text-[var(--app-text)]'
                  }`}
                >
                  <Link href={item.path} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <item.icon className="shrink-0" style={{ width: 16, height: 16 }} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      aria-label={
                        isSettingsItem
                          ? (settingsMenuOpen ? 'Collapse settings menu' : 'Expand settings menu')
                          : (productsMenuOpen ? 'Collapse products menu' : 'Expand products menu')
                      }
                      aria-expanded={isSettingsItem ? settingsMenuOpen : productsMenuOpen}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (isSettingsItem) {
                          setSettingsMenuOpen((open) => !open);
                          setProductsMenuOpen(false);
                        } else if (isProductsItem) {
                          setProductsMenuOpen((open) => !open);
                          setSettingsMenuOpen(false);
                        }
                      }}
                      className={`shrink-0 rounded-md p-0.5 transition-colors ${
                        active ? 'hover:bg-[#ebe7df]' : 'hover:bg-white/60'
                      }`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${showChildren ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {item.children && (
                  <div className={`${showChildren ? 'block' : 'hidden'} mb-2 pl-2`}>
                  <div className="space-y-0.5 rounded-xl border px-1.5 py-1.5 bg-white/45" style={{ borderColor: 'var(--app-border)' }}>
                      {item.children.map((child) => {
                        const childActive =
                          (pathname === '/settings' && activeSettingsView === child.view) ||
                          (pathname === '/products' && activeProductsView === child.view);
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`block rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                              childActive
                                ? 'bg-[var(--app-panel)] text-[var(--app-text)] border'
                                : 'text-[var(--app-text-muted)] hover:bg-white/60 hover:text-[var(--app-text)]'
                            }`}
                            style={childActive ? { borderColor: 'var(--app-border)' } : undefined}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: 'var(--app-border)' }}>
            {user?.username && (
              <a
                href={getStoreUrl(user.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-[var(--app-text-muted)] hover:bg-white/55 hover:text-[var(--app-text)] transition-colors"
              >
                <ExternalLink style={{ width: 16, height: 16 }} className="shrink-0" />
                View Store
              </a>
            )}
          </div>
        </nav>

        {/* Plan badge */}
        <div className="px-3 pb-3 shrink-0">
          {user?.plan === 'Free' ? (
            <Link
              href="/settings?view=billing"
              className="flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors bg-[#f5efe1] hover:bg-[#efe5d2]"
              style={{ borderColor: '#e2d5b4' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-amber-900">Free plan</p>
                <p className="text-[10px] text-amber-700 font-medium">Upgrade to Pro</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/settings?view=billing"
              className="flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors bg-[#e8f2eb] hover:bg-[#ddebe2]"
              style={{ borderColor: '#c5d8c8' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-emerald-900">Pro plan</p>
                <p className="text-[10px] text-emerald-700 font-medium">All features unlocked</p>
              </div>
            </Link>
          )}
        </div>

        {/* User */}
        <div className="px-3 pb-4 shrink-0 border-t pt-3 relative" style={{ borderColor: 'var(--app-border)' }}>
          <button
            type="button"
            onClick={() => router.push('/settings?view=account')}
            className="w-full flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/55"
            aria-label="Open account settings"
          >
            <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 overflow-hidden">
              {avatarContent}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-semibold leading-tight text-[var(--app-text)]">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="truncate text-[10px] text-[var(--app-text-muted)]">{user?.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 md:ml-[220px]">

        {/* TOP BAR */}
        <header className="h-14 bg-zinc-950 border-b border-zinc-800 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-5 shrink-0">
          {/* Mobile: logo or back button */}
          <div className="flex items-center gap-2 md:hidden">
            {headerVariant === 'back' ? (
              <button onClick={handleBack} className="p-1 -ml-1 text-white hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <AppLogo size="sm" href="/dashboard" textClassName="text-white" />
            )}
            {headerVariant === 'back' && pageTitle && (
              <div className="flex flex-col">
                <span className="font-bold text-[16px] text-white leading-tight">{pageTitle}</span>
                {pageSubtitle && <span className="text-[12px] text-zinc-400 font-medium leading-tight">{pageSubtitle}</span>}
              </div>
            )}
          </div>

          {/* Desktop: page title */}
          <div className="hidden md:flex items-center gap-4 min-w-0">
            <div className="flex w-[220px] shrink-0 items-center">
              <AppLogo size="sm" href="/dashboard" textClassName="text-white" />
            </div>
            {headerVariant === 'back' ? (
              <>
                <button onClick={handleBack} className="p-1 -ml-1 text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <span className="font-bold text-[16px] text-white leading-tight">{pageTitle}</span>
                  {pageSubtitle && <span className="text-[12px] text-zinc-400 font-medium leading-tight ml-2">{pageSubtitle}</span>}
                </div>
              </>
            ) : (
              <span className="truncate text-sm font-medium text-zinc-300">
                {activeNavLabel}
              </span>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {headerRight && <div className="flex items-center">{headerRight}</div>}

            {/* Notifications */}
            <button
              ref={bellRef}
              onClick={toggleNotif}
              className="relative p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950" />
              )}
            </button>

            <button
              ref={desktopAvatarRef}
              type="button"
              onClick={toggleDesktopProfile}
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-[#059669] text-white overflow-hidden transition-all hover:ring-2 hover:ring-[#059669]/30"
              aria-label="Profile menu"
            >
              {avatarContent}
            </button>

            {/* Avatar — mobile only (desktop uses sidebar) */}
            <button
              ref={mobileAvatarRef}
              onClick={toggleMobileProfile}
              className="md:hidden w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#059669]/40 transition-all"
              aria-label="Profile menu"
            >
              {avatarContent}
            </button>
          </div>
        </header>

        {desktopProfileOpen && (
          <div
            ref={desktopProfileRef}
            className="hidden md:block fixed top-[60px] right-4 z-50 w-[220px] bg-[var(--app-panel)] border rounded-2xl shadow-[0_18px_50px_rgba(24,24,18,0.12)] overflow-hidden"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button onClick={() => { setDesktopProfileOpen(false); router.push('/settings?view=account'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-panel-muted)] transition-colors">
                <User className="w-4 h-4 text-zinc-400" /> Edit profile
              </button>
              <button onClick={() => { setDesktopProfileOpen(false); router.push('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-panel-muted)] transition-colors">
                <Settings className="w-4 h-4 text-zinc-400" /> Settings
              </button>
            </div>
            <div className="border-t py-1" style={{ borderColor: 'var(--app-border)' }}>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATION PANEL */}
        {notifOpen && (
          <div
            ref={notifRef}
            className="fixed top-[56px] right-4 z-50 w-[340px] bg-[var(--app-panel)] border rounded-2xl shadow-[0_20px_60px_rgba(24,24,18,0.12)] overflow-hidden max-h-[480px] flex flex-col"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--app-border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                {notifs.length > 0 && (
                  <button onClick={clearAllNotifications}
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setNotifOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Bell className="w-8 h-8 text-zinc-200 mb-2" />
                  <p className="text-sm text-zinc-400">No notifications yet</p>
                  <p className="text-xs text-zinc-300 mt-1">WhatsApp inquiries will show up here</p>
                </div>
              ) : (
                notifs.map(n => (
                  <button key={n.id} onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-zinc-50 transition-colors hover:bg-zinc-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>{n.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[11px] text-zinc-300 mt-1">{formatDistanceToNow(new Date(n.date), { addSuffix: true })}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* MOBILE PROFILE DROPDOWN */}
        {mobileProfileOpen && (
          <div
            ref={mobileProfileRef}
            className="md:hidden fixed top-[56px] right-3 z-50 w-[220px] bg-[var(--app-panel)] border rounded-2xl shadow-[0_20px_60px_rgba(24,24,18,0.12)] overflow-hidden"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button onClick={() => { setMobileProfileOpen(false); router.push('/settings?view=account'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-panel-muted)] transition-colors">
                <User className="w-4 h-4 text-zinc-400" /> Edit profile
              </button>
              <button onClick={() => { setMobileProfileOpen(false); router.push('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-panel-muted)] transition-colors">
                <Settings className="w-4 h-4 text-zinc-400" /> Settings
              </button>
              {user?.username && (
                <a href={getStoreUrl(user.username)} target="_blank" rel="noopener noreferrer"
                  onClick={() => setMobileProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-panel-muted)] transition-colors">
                  <ExternalLink className="w-4 h-4 text-zinc-400" /> View store
                </a>
              )}
            </div>
            <div className="border-t py-1" style={{ borderColor: 'var(--app-border)' }}>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        )}

        {/* MOBILE SUB-TAB BAR — shown when on a route that has children */}
        {(() => {
          const activeItem = NAV_ITEMS.find(item => !item.exact && pathname.startsWith(item.path) && item.children);
          if (!activeItem) return null;
          const currentView = searchParams?.get('view') ?? '';
          return (
            <div
              className="md:hidden sticky top-14 z-20 bg-white border-b border-zinc-200 flex gap-1.5 px-3 py-2"
              style={{ overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {activeItem.children!.map((child) => {
                const isChildActive = currentView === child.view || (!currentView && activeItem.children![0].view === child.view);
                return (
                  <Link
                    key={child.path}
                    href={child.path}
                    className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      isChildActive
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          );
        })()}

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 pb-[52px] md:pb-6">
          <RenewalBanner />
          <div className={`px-4 pt-4 md:px-6 md:pt-6 min-w-0 ${isFullWidthPage ? 'w-full max-w-none' : 'max-w-[1200px]'}`}>
            {children}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden h-[52px] bg-zinc-900 border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const href = item.children && !active ? item.children[0].path : item.path;
            return (
              <Link
                key={item.path}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
