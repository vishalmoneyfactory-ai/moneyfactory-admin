'use client';

import { Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export default function Header({ title, action }) {
  const { toggle } = useSidebar();

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-4 backdrop-blur-md sm:px-8"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(8,8,8,0.85)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger – mobile only */}
        <button
          id="sidebar-toggle"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-white transition lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl truncate">{title}</h1>
          <p className="mt-0.5 hidden text-xs font-medium text-muted sm:block">Money Factory · Admin</p>
        </div>
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </header>
  );
}
