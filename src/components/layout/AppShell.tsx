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
    <div className="min-h-screen bg-[#F2F3F5] font-sans flex">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        ref={desktopSidebarRef}
        className="hidden md:flex flex-col w-[220px] shrink-0 fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-40"
      >

        {/* Logo */}
        <div className="h-[56px] flex items-center px-5 border-b border-gray-100 shrink-0">
          <AppLogo size="sm" href="/dashboard" />
        </div>

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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#ecfdf5] text-[#059669]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Link href={item.path} className="flex min-w-0 flex-1 items-center gap-3">
                    <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
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
                      className={`shrink-0 rounded-md p-1 transition-colors ${
                        active ? 'hover:bg-[#d1fae5]' : 'hover:bg-gray-100'
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
                    <div className="space-y-1 rounded-xl border border-gray-100 bg-gray-50 px-2 py-2">
                      {item.children.map((child) => {
                        const childActive =
                          (pathname === '/settings' && activeSettingsView === child.view) ||
                          (pathname === '/products' && activeProductsView === child.view);
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`block rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                              childActive
                                ? 'bg-white text-[#059669] shadow-sm'
                                : 'text-gray-500 hover:bg-white hover:text-gray-900'
                            }`}
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

          <div className="mt-3 pt-3 border-t border-gray-100">
            {user?.username && (
              <a
                href={getStoreUrl(user.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <ExternalLink style={{ width: 18, height: 18 }} className="shrink-0" />
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
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-900">Free plan</p>
                <p className="text-[10px] text-amber-700 font-medium">Upgrade to Pro →</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/settings?view=billing"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#ecfdf5] border border-[#059669]/20 hover:bg-[#d1fae5] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-green-900">Pro plan</p>
                <p className="text-[10px] text-green-700 font-medium">All features unlocked</p>
              </div>
            </Link>
          )}
        </div>

        {/* User */}
        <div className="px-3 pb-4 shrink-0 border-t border-gray-100 pt-3 relative">
          <div className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left">
            <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 overflow-hidden">
              {avatarContent}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[220px]">

        {/* TOP BAR */}
        <header className="h-[56px] bg-white border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-4 shrink-0">
          {/* Mobile: logo or back button */}
          <div className="flex items-center gap-2 md:hidden">
            {headerVariant === 'back' ? (
              <button onClick={handleBack} className="p-1 -ml-1 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <AppLogo size="sm" href="/dashboard" />
            )}
            {headerVariant === 'back' && pageTitle && (
              <div className="flex flex-col">
                <span className="font-bold text-[16px] text-gray-900 leading-tight">{pageTitle}</span>
                {pageSubtitle && <span className="text-[12px] text-gray-500 font-medium leading-tight">{pageSubtitle}</span>}
              </div>
            )}
          </div>

          {/* Desktop: page title */}
          <div className="hidden md:flex items-center gap-2">
            {headerVariant === 'back' ? (
              <>
                <button onClick={handleBack} className="p-1 -ml-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="font-bold text-[16px] text-gray-900 leading-tight">{pageTitle}</span>
                  {pageSubtitle && <span className="text-[12px] text-gray-500 font-medium leading-tight ml-2">{pageSubtitle}</span>}
                </div>
              </>
            ) : (
              <span className="text-sm font-semibold text-gray-400">
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
              className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
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
            className="hidden md:block fixed top-[60px] right-4 z-50 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button onClick={() => { setDesktopProfileOpen(false); router.push('/settings?view=account'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4 text-gray-400" /> Edit profile
              </button>
              <button onClick={() => { setDesktopProfileOpen(false); router.push('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" /> Settings
              </button>
            </div>
            <div className="border-t border-gray-100 py-1">
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
            className="fixed top-[56px] right-4 z-50 w-[340px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-[480px] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                {notifs.length > 0 && (
                  <button onClick={clearAllNotifications}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setNotifOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Bell className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                  <p className="text-xs text-gray-300 mt-1">WhatsApp inquiries will show up here</p>
                </div>
              ) : (
                notifs.map(n => (
                  <button key={n.id} onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[11px] text-gray-300 mt-1">{formatDistanceToNow(new Date(n.date), { addSuffix: true })}</p>
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
            className="md:hidden fixed top-[56px] right-3 z-50 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button onClick={() => { setMobileProfileOpen(false); router.push('/settings?view=account'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4 text-gray-400" /> Edit profile
              </button>
              <button onClick={() => { setMobileProfileOpen(false); router.push('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" /> Settings
              </button>
              {user?.username && (
                <a href={getStoreUrl(user.username)} target="_blank" rel="noopener noreferrer"
                  onClick={() => setMobileProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-400" /> View store
                </a>
              )}
            </div>
            <div className="border-t border-gray-100 py-1">
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
              className="md:hidden sticky top-[56px] z-20 bg-white border-b border-gray-100 flex gap-1.5 px-3 py-2"
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
                        ? 'bg-[#059669] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <main className="flex-1 overflow-y-auto pb-[72px] md:pb-6">
          <RenewalBanner />
          <div className={`px-4 pt-4 md:px-6 md:pt-6 ${isFullWidthPage ? 'w-full max-w-none' : 'max-w-[1200px]'}`}>
            {children}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden h-[64px] bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-2">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            // For items with children, link to first child when not already on that route
            const href = item.children && !active ? item.children[0].path : item.path;
            return (
              <Link
                key={item.path}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                  active ? 'text-[#059669]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
