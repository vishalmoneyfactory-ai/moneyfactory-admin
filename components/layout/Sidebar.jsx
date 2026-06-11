'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpen, LogOut, MessageSquare, Receipt, Settings, Shield, Tag, Users } from 'lucide-react';
import { clearSession, getUser } from '../../lib/auth';

const items = [
  ['Dashboard', '/dashboard', BarChart3],
  ['Courses', '/dashboard/courses', BookOpen],
  ['Students', '/dashboard/students', Users],
  ['Orders', '/dashboard/orders', Receipt],
  ['Coupons', '/dashboard/coupons', Tag],
  ['Notifications', '/dashboard/notifications', MessageSquare],
  ['Settings', '/dashboard/settings', Settings],
  ['Profile', '/dashboard/profile', Shield],
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const logout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-border bg-secondary">
      <div className="border-b border-border p-6">
        <div className="text-3xl font-black text-gold">MONEY FACTORY</div>
        <div className="mt-1 text-sm text-muted">Command center</div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map(([label, href, Icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-md border-l-2 px-4 py-3 text-sm font-semibold ${active ? 'border-gold bg-card text-gold' : 'border-transparent text-white hover:bg-card'}`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Link href="/dashboard/profile" className="mb-3 flex items-center gap-3 rounded-md border border-border bg-card p-3 hover:border-gold/60">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gold/40 bg-primary text-sm font-black text-gold">
            {user?.profileImage ? <img src={user.profileImage.startsWith('http') ? user.profileImage : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${user.profileImage}`} alt="" className="h-full w-full object-cover" /> : (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user?.name || 'Admin'}</div>
            <div className="truncate text-xs text-muted">{user?.email}</div>
          </div>
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm font-semibold text-error hover:bg-card">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
