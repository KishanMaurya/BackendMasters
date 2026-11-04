-- LOCAL DEVELOPMENT ONLY. Runs on `supabase db reset` and is never applied by `supabase db push`.
-- Gives the pages real rows to render during development. No user accounts are created here.

insert into public.tags (slug, name) values
  ('caching', 'Caching'),
  ('load-balancing', 'Load Balancing'),
  ('sliding-window', 'Sliding Window'),
  ('reliability', 'Reliability');

insert into public.articles
  (slug, title, description, content, category_id, reading_time_minutes, difficulty, status, is_featured, published_at)
values
  (
    'how-load-balancers-distribute-traffic',
    'How Load Balancers Distribute Traffic',
    'Round robin, least connections and consistent hashing, and how to choose between them.',
    E'## The problem\n\nOne server can only handle so many requests. A load balancer spreads requests across several, so no single one is overwhelmed.\n\n## Common algorithms\n\n- **Round robin:** each server takes a turn.\n- **Least connections:** the next request goes to the server with the fewest active connections.\n- **Consistent hashing:** the same key keeps reaching the same server, which suits caches.\n',
    (select id from public.categories where slug = 'hld'),
    6, 'easy', 'published', true, now() - interval '3 days'
  ),
  (
    'cache-stampede-explained',
    'What Is a Cache Stampede?',
    'Why one expired key can take down a database, and three ways to prevent it.',
    E'## The problem\n\nA popular key expires. Many requests miss at the same moment and all go to the database.\n\n## Prevention\n\n1. Coalesce concurrent requests, so only one recomputes the value.\n2. Add jitter to expiry times.\n3. Refresh the key before it expires.\n',
    (select id from public.categories where slug = 'system-design'),
    5, 'medium', 'published', true, now() - interval '2 days'
  ),
  (
    'sliding-window-pattern',
    'The Sliding Window Pattern',
    'Turn nested loops over a range into a single pass.',
    E'## The idea\n\nInstead of recomputing every subarray, keep a window and update it as its edges move.\n\n```typescript\nfunction maxSum(nums: number[], k: number): number {\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += nums[i];\n  let best = sum;\n  for (let i = k; i < nums.length; i++) {\n    sum += nums[i] - nums[i - k];\n    best = Math.max(best, sum);\n  }\n  return best;\n}\n```\n\nThis runs in O(n) time and O(1) space.\n',
    (select id from public.categories where slug = 'dsa'),
    4, 'easy', 'published', false, now() - interval '1 day'
  ),
  (
    'draft-sre-golden-signals',
    'The Four Golden Signals',
    'A draft, used to confirm drafts stay hidden from the public.',
    E'Work in progress.\n',
    (select id from public.categories where slug = 'observability'),
    3, null, 'draft', false, null
  );

insert into public.article_tags (article_id, tag_id)
select a.id, t.id
from (values
  ('how-load-balancers-distribute-traffic', 'load-balancing'),
  ('how-load-balancers-distribute-traffic', 'reliability'),
  ('cache-stampede-explained', 'caching'),
  ('cache-stampede-explained', 'reliability'),
  ('sliding-window-pattern', 'sliding-window')
) as pair (article_slug, tag_slug)
join public.articles a on a.slug = pair.article_slug
join public.tags t on t.slug = pair.tag_slug;
