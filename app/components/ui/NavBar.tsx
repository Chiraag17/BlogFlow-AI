import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export const NavBar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefers = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const init = saved ? saved === 'dark' : prefers;
    setIsDark(init);
    const html = document.documentElement;
    if (init) html.classList.add('dark'); else html.classList.remove('dark');
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark'); else html.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
      <Link href="/" className="text-xl font-serif text-[var(--color-primary)]">BlogFlow AI</Link>
      <nav className="hidden md:flex gap-6 text-sm">
        <Link href="#product" className="hover:text-[var(--color-primary)]">Product</Link>
        <Link href="#workflow" className="hover:text-[var(--color-primary)]">Workflow</Link>
        <Link href="#features" className="hover:text-[var(--color-primary)]">Features</Link>
        <Link href="#creators" className="hover:text-[var(--color-primary)]">For creators</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">Sign in</Link>
        <Link href="/generator" className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-surface)] rounded-md hover:bg-[var(--color-primary-hover)] flex items-center">Start creating</Link>
        <button
          onClick={() => setIsDark(prev => !prev)}
          className="p-2 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          aria-label="Toggle light/dark mode"
        >
          <Sun size={18} className={isDark ? 'hidden' : ''} style={{ color: 'var(--color-text)' }} />
          <Moon size={18} className={isDark ? '' : 'hidden'} style={{ color: 'var(--color-text)' }} />
        </button>
      </div>
    </header>
  );
};
