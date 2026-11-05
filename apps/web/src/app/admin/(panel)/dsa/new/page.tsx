import type { Metadata } from 'next';
import { loadAdmin } from '@/features/admin/api';
import { DsaEditor } from '@/features/admin/components/dsa-editor';

export const metadata: Metadata = { title: 'New problem' };

export const instant = false;

export default async function NewDsaProblemPage() {
  // Checks access. This page has no other data to load.
  await loadAdmin('/admin/me');
  return <DsaEditor problem={null} />;
}
