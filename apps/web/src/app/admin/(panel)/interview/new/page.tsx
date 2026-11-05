import type { Metadata } from 'next';
import type { AdminInterviewQuestion } from '@backendmasters/shared';
import { loadAdmin } from '@/features/admin/api';
import { QuestionEditor } from '@/features/admin/components/question-editor';

export const metadata: Metadata = { title: 'New question' };

export const instant = false;

export default async function NewInterviewQuestionPage() {
  const others = await loadAdmin<AdminInterviewQuestion[]>('/admin/interview-questions');
  return <QuestionEditor question={null} others={others} />;
}
