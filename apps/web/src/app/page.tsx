import { Suspense } from 'react';
import { connection } from 'next/server';
import { Database, Server } from 'lucide-react';
import { BRAND, type DependencyStatus } from '@backendmasters/shared';
import { Button } from '@/components/ui/button';
import { getHealth } from '@/lib/api/health';

/** Phase 1 placeholder: proves tokens, fonts, shadcn, shared types and the API link. Replaced in Phase 2. */
export default function FoundationPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="font-mono text-xs tracking-widest text-primary uppercase">{BRAND.domain}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{BRAND.name}</h1>
        <p className="text-lg text-muted-foreground">{BRAND.tagline}</p>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-6" aria-label="Service status">
        <Suspense fallback={<StatusRow icon={<Server />} label="API" value="checking" />}>
          <ServiceStatus />
        </Suspense>
      </section>

      <div className="flex gap-3">
        <Button size="lg">Primary action</Button>
        <Button size="lg" variant="outline">
          Secondary action
        </Button>
      </div>
    </main>
  );
}

async function ServiceStatus() {
  await connection();
  const health = await getHealth();

  return (
    <>
      <StatusRow icon={<Server />} label="API" value={health ? health.status : 'unreachable'} />
      <StatusRow
        icon={<Database />}
        label="Supabase"
        value={health ? describe(health.dependencies.supabase) : 'unknown'}
      />
    </>
  );
}

function describe(status: DependencyStatus): string {
  return status === 'not_configured' ? 'not configured' : status;
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground [&_svg]:size-4">
        {icon}
        {label}
      </span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
