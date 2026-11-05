import Link from 'next/link';
import { Frame, Wire } from '@/components/illustrations/primitives';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export function NotFoundContent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-24 sm:px-6">
      <Frame viewBox="0 0 320 60" className="max-w-xs">
        <Wire d="M8 30H200" />
        <Wire dashed d="M200 30H300" />
        <circle cx={8} cy={30} r={5} className="fill-primary" />
        <circle cx={312} cy={30} r={7} strokeDasharray="3 3" className="stroke-foreground/40" />
      </Frame>
      <p className="font-mono text-xs tracking-widest text-primary uppercase">404</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        This request never reached a server.
      </h1>
      <p className="text-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5')}>
          Back to home
        </Link>
        <Link
          href="/learn"
          className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 px-5')}
        >
          Learning paths
        </Link>
      </div>
    </div>
  );
}
