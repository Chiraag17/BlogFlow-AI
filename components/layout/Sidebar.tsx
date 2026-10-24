'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Globe, Search, PenTool, BookOpen,
  CheckCircle, Plug, Zap, BarChart3, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/websites', label: 'Websites', icon: Globe },
  { href: '/research', label: 'Research & Topics', icon: Search },
  { href: '/generator', label: 'Blog Generator', icon: PenTool },
  { href: '/content', label: 'Content Library', icon: BookOpen },
  { href: '/approvals', label: 'Approval Center', icon: CheckCircle, badgeKey: 'pending' as const },
  { href: '/integrations', label: 'CMS Integrations', icon: Plug },
  { href: '/automation', label: 'Automation', icon: Zap },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const setCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const blogs = useAppStore((s) => s.blogs);

  const pendingApprovalCount = blogs.filter((b) => b.status === 'pending_approval').length;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'sidebar',
          collapsed && 'collapsed',
          mobileOpen && 'mobile-open'
        )}
      >
        <Link href="/landing" className="sidebar-logo" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo-icon font-editorial font-bold text-sm">
            B
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight font-editorial text-[var(--color-text)] whitespace-nowrap">
              BlogFlow AI
            </span>
          )}
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-nav-item justify-between', isActive && 'active')}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <item.icon size={18} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </span>
                {!collapsed && item.badgeKey === 'pending' && pendingApprovalCount > 0 && (
                  <span className="text-xs font-mono tabular-nums text-[var(--color-accent)] font-semibold">
                    {pendingApprovalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-[var(--color-border)] hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-nav-item justify-center"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
