import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LogoMark } from '@/components/layout/logo';
import { adminFetch } from '@/features/admin/api';
import { SignInForm } from '@/features/admin/components/sign-in-form';

export const metadata: Metadata = { title: 'Sign in' };

export const instant = false;

async function isSignedInAdmin(): Promise<boolean> {
  try {
    await adminFetch('/admin/me');
    return true;
  } catch {
    return false;
  }
}

export default async function SignInPage() {
  if (await isSignedInAdmin()) redirect('/admin');

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 sm:p-8">
        <div className="space-y-3">
          <LogoMark />
          <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">For BackendMasters administrators.</p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
