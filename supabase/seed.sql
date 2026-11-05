-- LOCAL DEVELOPMENT ONLY. Runs on `supabase db reset` and is never applied by `supabase db push`.
-- Gives the pages real rows to render during development.
--
-- The two accounts below exist only in local databases, so their passwords are not secrets.
-- Sign-ups are off, which is why they are inserted here. Production accounts: see docs/ADMIN.md.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-00000000000a',
   'authenticated', 'authenticated', 'admin@backendmasters.test',
   extensions.crypt('local-admin-password', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Local Admin"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-00000000000b',
   'authenticated', 'authenticated', 'reader@backendmasters.test',
   extensions.crypt('local-reader-password', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"display_name":"Local Reader"}',
   now(), now(), '', '', '', '');

insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now()
from auth.users
where email like '%@backendmasters.test';

update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-00000000000a';


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
    E'## The problem\n\nOne server can only handle so many requests. A **load balancer** sits in front of several servers and spreads requests across them, so no single one is overwhelmed and any one of them can fail without taking the service down.\n\n```mermaid\nflowchart LR\n  C[Clients] --> LB[Load balancer]\n  LB --> A[Server 1]\n  LB --> B[Server 2]\n  LB --> D[Server 3]\n  A --> DB[(Database)]\n  B --> DB\n  D --> DB\n```\n\n> [!NOTE]\n> A load balancer is itself a single point of failure unless it runs as a redundant pair.\n\n## Choosing an algorithm\n\nThree algorithms cover most real systems:\n\n1. **Round robin** gives each server a turn.\n2. **Least connections** picks the server with the fewest active connections.\n3. **Consistent hashing** keeps a key on the same server, which suits caches.\n\n| Algorithm | Best for | Weakness |\n|---|---|---|\n| Round robin | Similar servers and similar requests | Ignores current load |\n| Least connections | Requests of very different lengths | Needs connection tracking |\n| Consistent hashing | Caches and sticky sessions | Can spread keys unevenly |\n\n### Round robin in code\n\nThe simplest version is a counter:\n\n```typescript\nclass RoundRobin {\n  private next = 0;\n\n  constructor(private readonly servers: string[]) {}\n\n  pick(): string {\n    const server = this.servers[this.next];\n    this.next = (this.next + 1) % this.servers.length;\n    return server;\n  }\n}\n```\n\nThe same idea in Go, where concurrent requests need an atomic counter:\n\n```go\ntype RoundRobin struct {\n\tservers []string\n\tnext    atomic.Uint64\n}\n\nfunc (r *RoundRobin) Pick() string {\n\tn := r.next.Add(1) - 1\n\treturn r.servers[n%uint64(len(r.servers))]\n}\n```\n\n### Health checks\n\nA balancer needs to stop sending traffic to unhealthy servers. A typical configuration:\n\n```json\n{\n  "path": "/health",\n  "intervalSeconds": 10,\n  "unhealthyThreshold": 3\n}\n```\n\n> "Everything fails, all the time." The design has to assume it.\n\n> [!WARNING]\n> A health check that also tests the database can mark every server unhealthy during a database blip, which turns a partial outage into a total one.\n\n## Where it fits\n\n- **Layer 4** balancers route by IP and port, and are very fast.\n- **Layer 7** balancers understand HTTP, so they can route by path or header.\n\nRead more about [the AWS options](https://docs.aws.amazon.com/elasticloadbalancing/) or browse the [high-level design track](/hld).\n\n![The BackendMasters mark](/icon.svg)\n\n## Trade-offs\n\nEvery request now takes one more network hop, and the balancer becomes critical infrastructure. For almost any service with more than one server, that is a price worth paying.\n',
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
    E'## The idea\n\nInstead of recomputing every subarray, keep a window and update it as its edges move.\n\n```typescript\nfunction maxSum(nums: number[], k: number): number {\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += nums[i];\n  let best = sum;\n  for (let i = k; i < nums.length; i++) {\n    sum += nums[i] - nums[i - k];\n    best = Math.max(best, sum);\n  }\n  return best;\n}\n```\n\nThis runs in O(n) time and O(1) space.\n\n## A longer example\n\nThe variable-size version keeps growing the window until it breaks a rule, then shrinks it:\n\n```java\nimport java.util.HashMap;\nimport java.util.Map;\n\npublic final class LongestSubstring {\n\n    private LongestSubstring() {}\n\n    public static int withoutRepeats(String text) {\n        Map<Character, Integer> lastSeen = new HashMap<>();\n        int best = 0;\n        int start = 0;\n\n        for (int end = 0; end < text.length(); end++) {\n            char current = text.charAt(end);\n            Integer previous = lastSeen.get(current);\n\n            if (previous != null && previous >= start) {\n                start = previous + 1;\n            }\n\n            lastSeen.put(current, end);\n            best = Math.max(best, end - start + 1);\n        }\n\n        return best;\n    }\n}\n```\n\nThe same logic in Python:\n\n```python\ndef longest_without_repeats(text: str) -> int:\n    last_seen = {}\n    best = start = 0\n    for end, char in enumerate(text):\n        if last_seen.get(char, -1) >= start:\n            start = last_seen[char] + 1\n        last_seen[char] = end\n        best = max(best, end - start + 1)\n    return best\n```\n\nSliding windows also appear in SQL:\n\n```sql\nselect day, avg(amount) over (order by day rows 6 preceding) as weekly_average\nfrom sales;\n```\n\nRun the tests with:\n\n```bash\njavac LongestSubstring.java && java LongestSubstringTest\n```\n',
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
