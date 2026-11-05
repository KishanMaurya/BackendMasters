import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { AdminInterviewQuestion } from '@backendmasters/shared';
import { loadAdmin, loadAdminOptional } from '@/features/admin/api';
import { QuestionEditor } from '@/features/admin/components/question-editor';
import { uuidSchema } from '@/features/admin/schemas';

export const metadata: Metadata = { title: 'Edit question' };

export const instant = false;

export default async function EditInterviewQuestionPage({
  params,
}: PageProps<'/admin/interview/[id]'>) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const [question, others] = await Promise.all([
    loadAdminOptional<AdminInterviewQuestion>(`/admin/interview-questions/${id}`),
    loadAdmin<AdminInterviewQuestion[]>('/admin/interview-questions'),
  ]);
  if (!question) notFound();

  return <QuestionEditor key={question.id} question={question} others={others} />;
}
