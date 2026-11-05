import type { Metadata } from 'next';
import Link from 'next/link';
import { DSA_TOPICS, type AdminDsaProblem } from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { loadAdmin } from '@/features/admin/api';
import { LearningTable } from '@/features/admin/components/learning-table';

export const metadata: Metadata = { title: 'DSA problems' };

export const instant = false;

export default async function AdminDsaPage() {
  const problems = await loadAdmin<AdminDsaProblem[]>('/admin/dsa-problems');
  const topicName = (slug: string) => DSA_TOPICS.find((topic) => topic.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">DSA problems</h1>
        <Link href="/admin/dsa/new" className={buttonVariants({ size: 'lg' })}>
          New problem
        </Link>
      </header>
      {problems.length > 0 ? (
        <LearningTable
          basePath="/admin/dsa"
          rows={problems.map((problem) => ({
            id: problem.id,
            title: problem.title,
            detail: topicName(problem.topic),
            difficulty: problem.difficulty,
            status: problem.status,
          }))}
        />
      ) : (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No problems yet.
        </p>
      )}
    </div>
  );
}
