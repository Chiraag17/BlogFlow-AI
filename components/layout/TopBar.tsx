'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Menu, Search, Plus, User, Sun, Moon,
  ChevronDown, LogOut, Settings, Loader2,
  FileText, Globe, PenTool, CheckCircle, Sparkles,
  ArrowRight, Command, X, BarChart3, Zap, Plug, BookOpen,
} from 'lucide-react';

import { useTheme } from '@/lib/theme';
import { useAppStore } from '@/lib/store';
import { getStatusLabel, truncate } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/websites': 'Websites',
  '/research': 'Research & Topics',
  '/generator': 'Blog Generator',
  '/content': 'Content Library',
  '/approvals': 'Approval Center',
  '/integrations': 'CMS Integrations',
  '/automation': 'Automation',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [commandOpen, setCommandOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const blogs = useAppStore((s) => s.blogs);
  const websites = useAppStore((s) => s.websites);

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] || 'Editorial Studio';

  const displayName = (session?.user as any)?.name || session?.user?.email || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Global ⌘K / Ctrl+K shortcut to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape' && commandOpen) {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen]);

  const commandItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const quickCommands = [
      {
        id: 'cmd-new-blog',
        group: 'Quick Commands',
        title: 'Launch New Blog Draft',
        subtitle: 'Open multi-agent blog generator',
        icon: PenTool,
        action: () => router.push('/generator'),
      },
      {
        id: 'cmd-approvals',
        group: 'Quick Commands',
        title: 'Review Pending Approvals',
        subtitle: 'Editorial quality gate & WordPress publishing',
        icon: CheckCircle,
        action: () => router.push('/approvals'),
      },
      {
        id: 'cmd-connect-site',
        group: 'Quick Commands',
        title: 'Connect Publication Website',
        subtitle: 'Add a domain or WordPress endpoint',
        icon: Globe,
        action: () => router.push('/websites'),
      },
      {
        id: 'cmd-theme',
        group: 'Quick Commands',
        title: isDark ? 'Switch to Light Paper Theme' : 'Switch to Dark Studio Theme',
        subtitle: 'Toggle workspace appearance',
        icon: isDark ? Sun : Moon,
        action: () => toggleTheme(),
      },
    ];

    const articleItems = blogs.slice(0, 8).map((b) => ({
      id: `blog-${b.id}`,
      group: 'Articles & Manuscripts',
      title: truncate(b.title, 60),
      subtitle: `${b.websiteName || 'Publication'} · ${getStatusLabel(b.status)} · ${b.wordCount.toLocaleString()} words`,
      icon: FileText,
      action: () =>
        router.push(b.status === 'pending_approval' ? '/approvals' : '/content'),
    }));

    const siteItems = websites.map((w) => ({
      id: `site-${w.id}`,
      group: 'Connected Publications',
      title: `Draft article for ${w.name}`,
      subtitle: `${w.url} · ${w.niche}`,
      icon: Globe,
      action: () => router.push(`/generator?websiteId=${encodeURIComponent(w.id)}`),
    }));

    const navItems = [
      { id: 'nav-overview', group: 'Navigation', title: 'Go to Overview', subtitle: 'Editorial Command Center', icon: Sparkles, action: () => router.push('/dashboard') },
      { id: 'nav-research', group: 'Navigation', title: 'Go to Research & Topics', subtitle: 'Tavily web research & topic discovery', icon: Search, action: () => router.push('/research') },
      { id: 'nav-content', group: 'Navigation', title: 'Go to Content Library', subtitle: 'All manuscripts and SEO reports', icon: BookOpen, action: () => router.push('/content') },
      { id: 'nav-analytics', group: 'Navigation', title: 'Go to Analytics', subtitle: 'Publishing telemetry & performance', icon: BarChart3, action: () => router.push('/analytics') },
      { id: 'nav-automation', group: 'Navigation', title: 'Go to Automation', subtitle: 'Scheduled cadence rules', icon: Zap, action: () => router.push('/automation') },
      { id: 'nav-integrations', group: 'Navigation', title: 'Go to CMS Integrations', subtitle: 'WordPress & webhook connections', icon: Plug, action: () => router.push('/integrations') },
    ];

    const all = [...quickCommands, ...articleItems, ...siteItems, ...navItems];
    if (!q) return all.slice(0, 10);
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [searchQuery, blogs, websites, isDark, router, toggleTheme]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, commandOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    setProfileOpen(false);
    try {
      await signOut({ redirect: false });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            onClick={onMenuClick}
            className="btn-ghost btn-icon lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-[var(--color-text-muted)] font-medium">
              Studio
            </span>
            <span className="hidden sm:inline text-[var(--color-text-muted)]">/</span>
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>
        </div>

        <div className="topbar-right">
          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden md:inline-flex items-center justify-between gap-6 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors cursor-pointer min-w-[230px]"
            aria-label="Open command palette"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <Search size={14} />
              <span>Search articles, sites, commands…</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="btn btn-ghost btn-icon md:hidden"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Primary Action */}
          <Link href="/generator" className="btn btn-primary btn-sm hidden sm:inline-flex whitespace-nowrap shrink-0">
            <Plus size={15} />
            <span>New Blog</span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
            aria-label="Toggle light/dark mode"
          >
            <Sun size={16} className={isDark ? 'hidden' : ''} />
            <Moon size={16} className={isDark ? '' : 'hidden'} />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              className="flex items-center gap-2 btn-ghost rounded-lg px-2 py-1.5 cursor-pointer"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User menu"
              aria-expanded={profileOpen}
            >
              {status === 'loading' ? (
                <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold select-none"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-primary-fg)',
                    }}
                  >
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold hidden md:block max-w-[120px] truncate text-[var(--color-text)]">
                    {displayName}
                  </span>
                  <ChevronDown size={14} className="hidden md:block text-[var(--color-text-muted)]" />
                </>
              )}
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 animate-slide-up py-1">
                  <div className="px-4 py-3 border-b border-[var(--color-border)]">
                    <p className="text-sm font-semibold truncate text-[var(--color-text)]">{displayName}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <div className="border-t border-[var(--color-border)]">
                    <button
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-bg-muted)] transition-colors w-full cursor-pointer"
                      onClick={handleSignOut}
                      disabled={signingOut}
                    >
                      {signingOut ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <LogOut size={16} />
                      )}
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global ⌘K Command Palette Modal */}
      {commandOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/45 backdrop-blur-xs animate-fade-in"
          onClick={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => (i + 1) % Math.max(1, commandItems.length));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) =>
                  (i - 1 + Math.max(1, commandItems.length)) % Math.max(1, commandItems.length)
                );
              } else if (e.key === 'Enter' && commandItems[selectedIndex]) {
                e.preventDefault();
                commandItems[selectedIndex].action();
                setCommandOpen(false);
                setSearchQuery('');
              }
            }}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
              <Command size={16} className="text-[var(--color-accent)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, connected websites, or run a command…"
                className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                aria-label="Close command palette"
              >
                <X size={15} />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {commandItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                  No matching articles, websites, or commands found.
                </div>
              ) : (
                commandItems.map((item, idx) => {
                  const Icon = item.icon;
                  const active = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        item.action();
                        setCommandOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-[var(--color-bg-muted)] text-[var(--color-primary)]">
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{item.title}</div>
                          <div className="text-[11px] text-[var(--color-text-muted)] truncate">
                            {item.group} · {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="shrink-0 opacity-60" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg)] text-[11px] text-[var(--color-text-muted)]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>·</span>
                <span>↵ Select</span>
                <span>·</span>
                <span>Esc Close</span>
              </div>
              <span>Editorial Command Palette</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
