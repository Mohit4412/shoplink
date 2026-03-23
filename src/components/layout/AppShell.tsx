'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronLeft, LayoutDashboard, Package, BarChart3, User, Store, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

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
  const { notifications, user } = useStore();
  const hasUnread = (notifications || []).some(n => !n.read);

  const handleBack = () => {
    // If we're in settings sub-pages using query params, pushing to /settings clears it
    if (pathname.includes('/settings')) {
      router.push('/settings');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F3F5] flex justify-center font-sans">
      <div className="w-full max-w-[520px] bg-white min-h-screen relative shadow-sm flex flex-col">

        {/* TOP HEADER */}
        <header className="h-[56px] bg-white border-b border-[#EEEEEE] sticky top-0 z-30 flex items-center justify-between px-4 shrink-0">
          {headerVariant === 'main' ? (
            <>
              {/* MAIN HEADER LEFT */}
              <div className="flex items-center gap-2">
                <div className="w-[28px] h-[28px] bg-gray-900 rounded-md flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[17px] text-gray-900 tracking-tight">MyShopLink</span>
              </div>

              {/* MAIN HEADER RIGHT */}
              <div className="flex items-center gap-3">
                {user?.username && (
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                    title="View your store"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                )}
                <button className="relative p-1 text-gray-500 hover:text-gray-900 transition-colors">
                  <Bell className="w-6 h-6" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                <div className="w-[30px] h-[30px] rounded-full bg-[#25D366] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {userInitials}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* BACK HEADER LEFT */}
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

              {/* BACK HEADER RIGHT */}
              {headerRight && (
                <div className="flex items-center">
                  {headerRight}
                </div>
              )}
            </>
          )}
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto w-full px-4 pt-4 pb-[80px]">
          {children}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav className="h-[64px] bg-white border-t border-[#EEEEEE] fixed bottom-0 w-full max-w-[520px] z-30 flex items-center justify-between px-2 pb-safe">
          <NavItem
            icon={<LayoutDashboard className="w-6 h-6" />}
            label="Dashboard"
            path="/dashboard"
            isActive={pathname === '/dashboard'}
          />
          <NavItem
            icon={<Package className="w-6 h-6" />}
            label="Products"
            path="/products"
            isActive={pathname.startsWith('/products')}
          />
          <NavItem
            icon={<BarChart3 className="w-6 h-6" />}
            label="Analytics"
            path="/analytics"
            isActive={pathname.startsWith('/analytics')}
          />
          <NavItem
            icon={<User className="w-6 h-6" />}
            label="Account"
            path="/settings"
            isActive={pathname.startsWith('/settings')}
          />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, path, isActive }: { icon: React.ReactNode; label: string; path: string; isActive: boolean }) {
  return (
    <Link
      href={path}
      className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${isActive ? 'text-[#25D366]' : 'text-[#9CA3AF] hover:text-gray-600'
        }`}
    >
      <div className={isActive ? 'text-[#25D366]' : ''}>
        {icon}
      </div>
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}
