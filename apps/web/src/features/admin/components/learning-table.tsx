import Link from 'next/link';
import { DifficultyBadge } from '@/components/catalog/difficulty-badge';
import type { Difficulty } from '@backendmasters/shared';
import { StateBadge } from './state-badge';

export interface LearningRow {
  id: string;
  title: string;
  detail: string;
  difficulty: Difficulty;
  status: 'draft' | 'published';
}

export function LearningTable({ rows, basePath }: { rows: LearningRow[]; basePath: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b text-left font-mono text-xs text-muted-foreground">
            <th scope="col" className="px-4 py-3 font-normal">
              Title
            </th>
            <th scope="col" className="px-4 py-3 font-normal">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-normal">
              Difficulty
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <Link href={`${basePath}/${row.id}`} className="font-medium hover:text-primary">
                  {row.title}
                </Link>
                <span className="block font-mono text-xs text-muted-foreground">{row.detail}</span>
              </td>
              <td className="px-4 py-3">
                <StateBadge state={row.status} />
              </td>
              <td className="px-4 py-3">
                <DifficultyBadge difficulty={row.difficulty} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
