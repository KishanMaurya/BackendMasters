'use client';

import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-5 px-4 py-24 sm:px-6">
      <p className="font-mono text-xs tracking-widest text-primary uppercase">
        Something went wrong
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">This page couldn&apos;t be loaded.</h1>
      <p className="text-lg text-muted-foreground">
        It&apos;s likely a temporary problem on our side. Please try again in a moment.
      </p>
      <div>
        <button
          type="button"
          onClick={reset}
          className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5')}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
