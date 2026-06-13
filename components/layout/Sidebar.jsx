'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpen, HandCoins, LogOut, MessageSquare, Receipt, Settings, Shield, Tag, Users, X } from 'lucide-react';
import { clearSession, getUser } from '../../lib/auth';
import { useSidebar } from './SidebarContext';

const items = [
  ['Dashboard', '/dashboard', BarChart3],
  ['Courses', '/dashboard/courses', BookOpen],
  ['Students', '/dashboard/students', Users],
  ['Orders', '/dashboard/orders', Receipt],
  ['Referrals', '/dashboard/referrals', HandCoins],
  ['Coupons', '/dashboard/coupons', Tag],
  ['Notifications', '/dashboard/notifications', MessageSquare],
  ['Settings', '/dashboard/settings', Settings],
  ['Profile', '/dashboard/profile', Shield],
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const { open, close } = useSidebar();

  const logout = () => {
    clearSession();
    router.replace('/login');
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #E6A800 100%)', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}
        >
          <span className="text-base font-black text-black">M</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-black tracking-tight text-white">Money Factory</div>
          <div className="text-xs font-medium text-muted">Admin Command Center</div>
        </div>
        {/* Close button – mobile only */}
        <button
          onClick={close}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-white transition lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map(([label, href, Icon]) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-[#888] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                size={17}
                className={`shrink-0 transition-colors ${active ? 'text-gold' : 'text-[#555] group-hover:text-white'}`}
              />
              <span>{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User panel */}
      <div className="border-t p-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <Link
          href="/dashboard/profile"
          onClick={close}
          className="mb-2 flex items-center gap-3 rounded-lg p-3 transition hover:bg-white/5"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-bold text-gold"
            style={{ border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.08)' }}
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage.startsWith('http')
                  ? user.profileImage
                  : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${user.profileImage}`
                }
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{user?.name || 'Admin'}</div>
            <div className="truncate text-xs text-muted">{user?.email}</div>
          </div>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#888] transition hover:bg-error/10 hover:text-error"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <aside
        className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r lg:flex"
        style={{
          background: 'linear-gradient(180deg, #0E0E0E 0%, #0A0A0A 100%)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {navContent}
      </aside>

      {/* ── Mobile overlay backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r transition-transform duration-300 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0E0E0E 0%, #0A0A0A 100%)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
        aria-modal={open}
        role="dialog"
      >
        {navContent}
      </aside>
    </>
  );
}
