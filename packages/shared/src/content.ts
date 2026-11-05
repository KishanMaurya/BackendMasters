/** Content contracts shared by the API and the web app. */

export const CATEGORY_SLUGS = [
  'dsa',
  'lld',
  'hld',
  'system-design',
  'aws',
  'observability',
  'backend-engineering',
  'interview-questions',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: CategorySlug;
  categoryName: string;
  coverImageUrl: string | null;
  readingTimeMinutes: number;
  difficulty: Difficulty | null;
  publishedAt: string;
  isFeatured: boolean;
}

export interface ArticleAuthor {
  displayName: string;
  avatarUrl: string | null;
}

export interface TagSummary {
  slug: string;
  name: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  tags: TagSummary[];
  author: ArticleAuthor | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

export interface CategorySummary {
  slug: CategorySlug;
  name: string;
  description: string;
  articleCount: number;
}

/** Topics of the DSA module. Problems store the slug. */
export const DSA_TOPICS = [
  { slug: 'arrays', name: 'Arrays' },
  { slug: 'strings', name: 'Strings' },
  { slug: 'hash-maps', name: 'Hash Maps' },
  { slug: 'linked-lists', name: 'Linked Lists' },
  { slug: 'stacks', name: 'Stacks' },
  { slug: 'queues', name: 'Queues' },
  { slug: 'trees', name: 'Trees' },
  { slug: 'binary-search-trees', name: 'Binary Search Trees' },
  { slug: 'graphs', name: 'Graphs' },
  { slug: 'heaps', name: 'Heaps' },
  { slug: 'sorting', name: 'Sorting' },
  { slug: 'searching', name: 'Searching' },
  { slug: 'dynamic-programming', name: 'Dynamic Programming' },
  { slug: 'recursion', name: 'Recursion' },
  { slug: 'backtracking', name: 'Backtracking' },
  { slug: 'sliding-window', name: 'Sliding Window' },
  { slug: 'two-pointers', name: 'Two Pointers' },
] as const;

export type DsaTopic = (typeof DSA_TOPICS)[number]['slug'];

export const DSA_TOPIC_SLUGS: readonly DsaTopic[] = DSA_TOPICS.map(({ slug }) => slug);

export const SOLUTION_LANGUAGES = [
  { key: 'javascript', label: 'JavaScript', fence: 'js' },
  { key: 'typescript', label: 'TypeScript', fence: 'ts' },
  { key: 'java', label: 'Java', fence: 'java' },
  { key: 'go', label: 'Go', fence: 'go' },
] as const;

export type SolutionLanguage = (typeof SOLUTION_LANGUAGES)[number]['key'];

export type DsaSolutions = Record<SolutionLanguage, string>;

export interface DsaExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DsaProblemSummary {
  id: string;
  slug: string;
  title: string;
  topic: DsaTopic;
  difficulty: Difficulty;
}

export interface DsaProblemDetail extends DsaProblemSummary {
  problemStatement: string;
  examples: DsaExample[];
  constraints: string[];
  bruteForceApproach: string;
  optimizedApproach: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  dryRun: string;
  solutions: DsaSolutions;
  publishedAt: string;
  updatedAt: string;
}

export interface DsaTopicCount {
  topic: DsaTopic;
  count: number;
}

export interface InterviewQuestionSummary {
  id: string;
  slug: string;
  title: string;
  technology: string;
  topic: string;
  interviewCategory: string | null;
  difficulty: Difficulty;
  shortAnswer: string;
}

export interface InterviewQuestionDetail extends InterviewQuestionSummary {
  detailedExplanation: string;
  practicalExample: string;
  codeExample: string | null;
  codeLanguage: string | null;
  related: InterviewQuestionSummary[];
  publishedAt: string;
  updatedAt: string;
}

export interface InterviewFacets {
  technologies: string[];
  topics: string[];
  interviewCategories: string[];
}

/** Published articles per tag within one category. */
export interface TagUsage {
  slug: string;
  articleCount: number;
}

export type ContentKind = 'article' | 'problem' | 'question';

/** The public address of any piece of content. */
export function contentPath(kind: ContentKind, slug: string): string {
  switch (kind) {
    case 'article':
      return `/articles/${slug}`;
    case 'problem':
      return `/dsa/${slug}`;
    case 'question':
      return `/interview-questions/${slug}`;
  }
}

export interface SearchResult {
  kind: ContentKind;
  slug: string;
  title: string;
  /** Plain text. Markdown markers are removed by the API. */
  description: string;
  categorySlug: CategorySlug;
  categoryName: string;
  difficulty: Difficulty | null;
}

export interface SearchSuggestion {
  kind: ContentKind;
  slug: string;
  title: string;
}

export interface SitemapEntry {
  kind: ContentKind;
  slug: string;
  updatedAt: string;
}
