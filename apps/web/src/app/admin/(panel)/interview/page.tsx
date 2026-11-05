import type { Metadata } from 'next';
import Link from 'next/link';
import type { AdminInterviewQuestion } from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { loadAdmin } from '@/features/admin/api';
import { LearningTable } from '@/features/admin/components/learning-table';

export const metadata: Metadata = { title: 'Interview questions' };

export const instant = false;

export default async function AdminInterviewPage() {
  const questions = await loadAdmin<AdminInterviewQuestion[]>('/admin/interview-questions');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Interview questions</h1>
        <Link href="/admin/interview/new" className={buttonVariants({ size: 'lg' })}>
          New question
        </Link>
      </header>
      {questions.length > 0 ? (
        <LearningTable
          basePath="/admin/interview"
          rows={questions.map((question) => ({
            id: question.id,
            title: question.title,
            detail: `${question.technology} · ${question.topic}`,
            difficulty: question.difficulty,
            status: question.status,
          }))}
        />
      ) : (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No questions yet.
        </p>
      )}
    </div>
  );
}
