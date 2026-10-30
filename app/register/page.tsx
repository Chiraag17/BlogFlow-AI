'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import MorphingAuthPortal from '@/components/auth/MorphingAuthPortal';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#05060B]">
          <Loader2 className="animate-spin text-emerald-400" size={28} />
        </div>
      }
    >
      <MorphingAuthPortal initialMode="register" />
    </Suspense>
  );
}
