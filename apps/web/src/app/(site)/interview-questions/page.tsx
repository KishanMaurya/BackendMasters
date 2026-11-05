import { Suspense } from 'react';
import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';
import { QuestionBank, QuestionBankSkeleton } from '@/features/interview/components/question-bank';

export const metadata = categoryMetadata('interview-questions');

export default function Page({ searchParams }: PageProps<'/interview-questions'>) {
  return (
    <CategoryPage slug="interview-questions">
      <section aria-labelledby="questions" className="min-w-0">
        <Suspense fallback={<QuestionBankSkeleton />}>
          <QuestionBank searchParams={searchParams} />
        </Suspense>
      </section>
    </CategoryPage>
  );
}
