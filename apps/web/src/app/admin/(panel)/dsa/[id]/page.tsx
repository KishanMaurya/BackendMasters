import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { AdminDsaProblem } from '@backendmasters/shared';
import { loadAdminOptional } from '@/features/admin/api';
import { DsaEditor } from '@/features/admin/components/dsa-editor';
import { uuidSchema } from '@/features/admin/schemas';

export const metadata: Metadata = { title: 'Edit problem' };

export const instant = false;

export default async function EditDsaProblemPage({ params }: PageProps<'/admin/dsa/[id]'>) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const problem = await loadAdminOptional<AdminDsaProblem>(`/admin/dsa-problems/${id}`);
  if (!problem) notFound();

  return <DsaEditor key={problem.id} problem={problem} />;
}
