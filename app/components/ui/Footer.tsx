import Link from 'next/link';

export const Footer: React.FC = () => (
  <footer className="px-6 py-8 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg)]">
    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-serif text-[var(--color-text)] mb-2">BlogFlow AI</h3>
        <p>AI‑assisted content research, drafting and publishing in one editorial studio.</p>
      </div>
      <div>
        <h4 className="font-medium mb-2 text-[var(--color-text)]">Product</h4>
        <ul className="space-y-1">
          <li><Link href="#product" className="hover:text-[var(--color-primary)]">Product</Link></li>
          <li><Link href="#workflow" className="hover:text-[var(--color-primary)]">Workflow</Link></li>
          <li><Link href="#features" className="hover:text-[var(--color-primary)]">Features</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-medium mb-2 text-[var(--color-text)]">Account</h4>
        <ul className="space-y-1">
          <li><Link href="/login" className="hover:text-[var(--color-primary)]">Sign in</Link></li>
        </ul>
      </div>
    </div>
  </footer>
);
