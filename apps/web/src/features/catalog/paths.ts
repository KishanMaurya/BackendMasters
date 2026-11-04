import type { CategorySlug } from '@backendmasters/shared';

export interface LearningPath {
  id: string;
  name: string;
  audience: string;
  stations: readonly CategorySlug[];
}

export const LEARNING_PATHS: readonly LearningPath[] = [
  {
    id: 'interview',
    name: 'Crack the senior interview',
    audience: 'For engineers preparing for backend and senior-level interview loops.',
    stations: ['dsa', 'lld', 'hld', 'system-design', 'interview-questions'],
  },
  {
    id: 'production',
    name: 'Build for production',
    audience: 'For developers moving from writing features to owning services.',
    stations: ['backend-engineering', 'hld', 'observability'],
  },
  {
    id: 'cloud',
    name: 'Run it in the cloud',
    audience: 'For engineers taking responsibility for infrastructure and operations.',
    stations: ['backend-engineering', 'aws', 'observability', 'system-design'],
  },
];
