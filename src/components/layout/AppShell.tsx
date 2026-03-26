'use client';

import React, { ReactNode, useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronLeft, LayoutDashboard, Package, BarChart3, User, Store, ExternalLink, CheckCheck, Trash2, X, LogOut, Settings } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatDistanceToNow } from 'date-fns';
import { AppLogo } from '../ui/AppLogo';
import { RenewalBanner } from '../billing/RenewalBanner';

interface AppShellProps {
  children: ReactNode;
  headerVariant?: 'main' | 'back';
  pageTitle?: string;
  pageSubtitle?: string;
  headerRight?: ReactNode;
  userInitials?: string;
}

export function AppShell({
  children,
  headerVariant = 'main',
  pageTitle,
  pageSubtitle,
  headerRight,
  userInitials = 'U'
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, user, markNotificationRead, markAllNotificationsRead, clearAllNotifications, logout } = useStore();
  const notifs = notifications || [];
  const unreadCount = notifs.filter(n => !n.read).length;

  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  // Close notification panel when profile opens and vice versa
  const togglePanel = () => { setPanelOpen(v => !v); setProfileOpen(false); };
  const toggleProfile = () => { setProfileOpen(v => !v); setPanelOpen(false); };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target) && bellRef.current && !bellRef.current.contains(target)) {
        setPanelOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target) && avatarRef.current && !avatarRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    if (window.confirm('Are you sure you want to log out?')) logout();
  };

  const handleBack = () => {
    if (pathname.includes('/settings')) {
      router.push('/settings');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F3F5] flex justify-center font-sans">
      <div className="w-full max-w-[720px] bg-white min-h-screen relative shadow-sm flex flex-col">

        {/* TOP HEADER */}
        <header className="h-[56px] bg-white border-b border-[#EEEEEE] sticky top-0 z-30 flex items-center justify-between px-4 shrink-0">
          {headerVariant === 'main' ? (
            <>
              <div className="flex items-center gap-2">
                <AppLogo size="sm" href="/dashboard" />
              </div>

              <div className="flex items-center gap-3">
                {user?.username && (
                  <Link
                    href={`https://${user.username}.myshoplink.site`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                    title="View your store"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                )}
                <button
                  ref={bellRef}
                  onClick={togglePanel}
                  className="relative p-1 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </button>
                <button
                  ref={avatarRef}
                  onClick={toggleProfile}
                  className="w-[30px] h-[30px] rounded-full overflow-hidden bg-[#059669] text-white flex items-center justify-center text-sm font-bold shadow-sm hover:ring-2 hover:ring-[#059669]/40 transition-all"
                  aria-label="Profile menu"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-1 -ml-1 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                  <span className="font-bold text-[16px] text-gray-900 leading-tight">{pageTitle}</span>
                  {pageSubtitle && (
                    <span className="text-[12px] text-gray-500 font-medium leading-tight">{pageSubtitle}</span>
                  )}
                </div>
              </div>
              {headerRight && <div className="flex items-center">{headerRight}</div>}
            </>
          )}
        </header>

        {/* PROFILE DROPDOWN */}
        {profileOpen && (
          <div
            ref={profileRef}
            className="absolute top-[56px] right-0 z-40 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden mr-3 mt-1"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                {user?.plan || 'Free'}
              </span>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={() => { setProfileOpen(false); router.push('/settings?view=account'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Edit profile
              </button>
              <button
                onClick={() => { setProfileOpen(false); router.push('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </button>
              {user?.username && (
                <a
                  href={`https://${user.username}.myshoplink.site`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  View store
                </a>
              )}
            </div>

            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATION PANEL */}
        {panelOpen && (
          <div
            ref={panelRef}
            className="absolute top-[56px] right-0 left-0 z-40 bg-white border-b border-gray-100 shadow-lg max-h-[420px] flex flex-col"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                {notifs.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Bell className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                  <p className="text-xs text-gray-300 mt-1">WhatsApp inquiries and activity will show up here</p>
                </div>
              ) : (
                notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[11px] text-gray-300 mt-1">
                        {formatDistanceToNow(new Date(n.date), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto w-full pb-[80px]">
          <RenewalBanner />
          <div className="px-4 pt-4">
            {children}
          </div>
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav className="h-[64px] bg-white border-t border-[#EEEEEE] fixed bottom-0 w-full max-w-[720px] z-30 flex items-center justify-between px-2 pb-safe">
          <NavItem icon={<LayoutDashboard className="w-6 h-6" />} label="Dashboard" path="/dashboard" isActive={pathname === '/dashboard'} />
          <NavItem icon={<Package className="w-6 h-6" />} label="Products" path="/products" isActive={pathname.startsWith('/products')} />
          <NavItem icon={<BarChart3 className="w-6 h-6" />} label="Analytics" path="/analytics" isActive={pathname.startsWith('/analytics')} />
          <NavItem icon={<User className="w-6 h-6" />} label="Account" path="/settings" isActive={pathname.startsWith('/settings')} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, path, isActive }: { icon: React.ReactNode; label: string; path: string; isActive: boolean }) {
  return (
    <Link
      href={path}
      className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
        isActive ? 'text-[#059669]' : 'text-[#9CA3AF] hover:text-gray-600'
      }`}
    >
      <div className={isActive ? 'text-[#059669]' : ''}>{icon}</div>
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}
