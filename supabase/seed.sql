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
  ('sliding-window', 'Sliding Window'),
  ('reliability', 'Reliability')
on conflict (slug) do nothing;

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

-- DSA problems. Every solution here was run against its examples in all four languages.
insert into public.dsa_problems
  (slug, title, category_id, topic, difficulty, problem_statement, examples, problem_constraints,
   brute_force_approach, optimized_approach, explanation, time_complexity, space_complexity,
   dry_run, solutions, status, published_at)
values (
  $bm$two-sum$bm$, $bm$Two Sum$bm$,
  (select id from public.categories where slug = 'dsa'),
  $bm$hash-maps$bm$, 'easy',
  $bm$Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.

Each input has exactly one solution, and you can't use the same element twice.$bm$,
  $bm$[{"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}, {"input": "nums = [3, 2, 4], target = 6", "output": "[1, 2]"}]$bm$::jsonb,
  array[$bm$2 ≤ nums.length ≤ 10⁴$bm$, $bm$-10⁹ ≤ nums[i] ≤ 10⁹$bm$, $bm$Exactly one valid answer exists$bm$],
  $bm$Check every pair with two nested loops. It's simple and needs no extra memory, but it does about n²/2 comparisons, which is far too slow at 10⁴ elements.$bm$,
  $bm$For each number, the only partner that works is `target - number`. Keep a hash map of the numbers already seen and their indices, so finding that partner takes constant time.$bm$,
  $bm$Checking the map **before** inserting the current number is what stops an element pairing with itself. With `[3, 3]` and a target of 6, the first 3 finds nothing and is stored, and the second 3 finds the first.$bm$,
  $bm$O(n)$bm$, $bm$O(n)$bm$,
  $bm$`nums = [2, 7, 11, 15]`, `target = 9`

| i | nums[i] | needed | seen before this step | result |
| --- | --- | --- | --- | --- |
| 0 | 2 | 7 | `{}` | store 2 → 0 |
| 1 | 7 | 2 | `{2: 0}` | found, return `[0, 1]` |$bm$,
  $bm${"javascript": "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const needed = target - nums[i];\n    if (seen.has(needed)) return [seen.get(needed), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}", "typescript": "function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const needed = target - nums[i];\n    const match = seen.get(needed);\n    if (match !== undefined) return [match, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}", "java": "int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        Integer match = seen.get(target - nums[i]);\n        if (match != null) return new int[] {match, i};\n        seen.put(nums[i], i);\n    }\n    return new int[0];\n}", "go": "func twoSum(nums []int, target int) []int {\n\tseen := make(map[int]int, len(nums))\n\tfor i, n := range nums {\n\t\tif match, ok := seen[target-n]; ok {\n\t\t\treturn []int{match, i}\n\t\t}\n\t\tseen[n] = i\n\t}\n\treturn nil\n}"}$bm$::jsonb,
  'published', now() - interval '1 days'
);
insert into public.dsa_problems
  (slug, title, category_id, topic, difficulty, problem_statement, examples, problem_constraints,
   brute_force_approach, optimized_approach, explanation, time_complexity, space_complexity,
   dry_run, solutions, status, published_at)
values (
  $bm$longest-substring-without-repeating-characters$bm$, $bm$Longest Substring Without Repeating Characters$bm$,
  (select id from public.categories where slug = 'dsa'),
  $bm$sliding-window$bm$, 'medium',
  $bm$Given a string `s`, find the length of the longest substring that contains no repeated characters.

A substring is contiguous, so `pwke` is not a substring of `pwwkew`.$bm$,
  $bm$[{"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\""}, {"input": "s = \"bbbbb\"", "output": "1"}, {"input": "s = \"pwwkew\"", "output": "3", "explanation": "The answer is \"wke\""}]$bm$::jsonb,
  array[$bm$0 ≤ s.length ≤ 5 × 10⁴$bm$, $bm$s contains letters, digits, symbols and spaces$bm$],
  $bm$Try every substring and check it for repeats with a set. That is O(n²) substrings with an O(n) check, so O(n³) overall.$bm$,
  $bm$Keep a window `[start, end]` that never contains a repeat, and remember where each character was last seen. When `end` reaches a character already inside the window, jump `start` to just past its previous position.$bm$,
  $bm$`start` only ever moves forward, so each character is handled once. The `previous >= start` check matters: a character seen *before* the window isn't a repeat. Without it, `abba` wrongly moves `start` backwards at the final `a`.$bm$,
  $bm$O(n)$bm$, $bm$O(k), where k is the alphabet size$bm$,
  $bm$`s = "abba"`

| end | char | previous | start | window | longest |
| --- | --- | --- | --- | --- | --- |
| 0 | a | none | 0 | `a` | 1 |
| 1 | b | none | 0 | `ab` | 2 |
| 2 | b | 1 | 2 | `b` | 2 |
| 3 | a | 0, outside the window | 2 | `ba` | 2 |$bm$,
  $bm${"javascript": "function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let start = 0;\n  let longest = 0;\n  for (let end = 0; end < s.length; end++) {\n    const previous = lastSeen.get(s[end]);\n    if (previous !== undefined && previous >= start) start = previous + 1;\n    lastSeen.set(s[end], end);\n    longest = Math.max(longest, end - start + 1);\n  }\n  return longest;\n}", "typescript": "function lengthOfLongestSubstring(s: string): number {\n  const lastSeen = new Map<string, number>();\n  let start = 0;\n  let longest = 0;\n  for (let end = 0; end < s.length; end++) {\n    const previous = lastSeen.get(s[end]);\n    if (previous !== undefined && previous >= start) start = previous + 1;\n    lastSeen.set(s[end], end);\n    longest = Math.max(longest, end - start + 1);\n  }\n  return longest;\n}", "java": "int lengthOfLongestSubstring(String s) {\n    Map<Character, Integer> lastSeen = new HashMap<>();\n    int start = 0;\n    int longest = 0;\n    for (int end = 0; end < s.length(); end++) {\n        Integer previous = lastSeen.get(s.charAt(end));\n        if (previous != null && previous >= start) start = previous + 1;\n        lastSeen.put(s.charAt(end), end);\n        longest = Math.max(longest, end - start + 1);\n    }\n    return longest;\n}", "go": "func lengthOfLongestSubstring(s string) int {\n\tlastSeen := make(map[byte]int)\n\tstart, longest := 0, 0\n\tfor end := 0; end < len(s); end++ {\n\t\tif previous, ok := lastSeen[s[end]]; ok && previous >= start {\n\t\t\tstart = previous + 1\n\t\t}\n\t\tlastSeen[s[end]] = end\n\t\tif end-start+1 > longest {\n\t\t\tlongest = end - start + 1\n\t\t}\n\t}\n\treturn longest\n}"}$bm$::jsonb,
  'published', now() - interval '2 days'
);
insert into public.dsa_problems
  (slug, title, category_id, topic, difficulty, problem_statement, examples, problem_constraints,
   brute_force_approach, optimized_approach, explanation, time_complexity, space_complexity,
   dry_run, solutions, status, published_at)
values (
  $bm$trapping-rain-water$bm$, $bm$Trapping Rain Water$bm$,
  (select id from public.categories where slug = 'dsa'),
  $bm$two-pointers$bm$, 'hard',
  $bm$Given `n` non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.$bm$,
  $bm$[{"input": "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]", "output": "6"}, {"input": "height = [4, 2, 0, 3, 2, 5]", "output": "9"}]$bm$::jsonb,
  array[$bm$0 ≤ height.length ≤ 2 × 10⁴$bm$, $bm$0 ≤ height[i] ≤ 10⁵$bm$],
  $bm$The water above a bar is `min(tallest to the left, tallest to the right) - its height`. Scanning both directions for every bar costs O(n²).$bm$,
  $bm$Move two pointers inward from the ends, tracking the tallest bar seen on each side. Always process the side with the shorter bar, because its water level is already decided.$bm$,
  $bm$If `height[left] < height[right]`, a bar at least as tall as `height[left]` exists on the right. So the water at `left` depends only on `leftMax`, whatever lies between the pointers. The same reasoning applies in reverse on the other side.$bm$,
  $bm$O(n)$bm$, $bm$O(1)$bm$,
  $bm$`height = [4, 2, 0, 3, 2, 5]`

| left | right | side moved | max on that side | water added | total |
| --- | --- | --- | --- | --- | --- |
| 0 | 5 | left | 4 | 0 | 0 |
| 1 | 5 | left | 4 | 2 | 2 |
| 2 | 5 | left | 4 | 4 | 6 |
| 3 | 5 | left | 4 | 1 | 7 |
| 4 | 5 | left | 4 | 2 | 9 |$bm$,
  $bm${"javascript": "function trap(height) {\n  let left = 0;\n  let right = height.length - 1;\n  let leftMax = 0;\n  let rightMax = 0;\n  let water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      leftMax = Math.max(leftMax, height[left]);\n      water += leftMax - height[left];\n      left++;\n    } else {\n      rightMax = Math.max(rightMax, height[right]);\n      water += rightMax - height[right];\n      right--;\n    }\n  }\n  return water;\n}", "typescript": "function trap(height: number[]): number {\n  let left = 0;\n  let right = height.length - 1;\n  let leftMax = 0;\n  let rightMax = 0;\n  let water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      leftMax = Math.max(leftMax, height[left]);\n      water += leftMax - height[left];\n      left++;\n    } else {\n      rightMax = Math.max(rightMax, height[right]);\n      water += rightMax - height[right];\n      right--;\n    }\n  }\n  return water;\n}", "java": "int trap(int[] height) {\n    int left = 0;\n    int right = height.length - 1;\n    int leftMax = 0;\n    int rightMax = 0;\n    int water = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            leftMax = Math.max(leftMax, height[left]);\n            water += leftMax - height[left];\n            left++;\n        } else {\n            rightMax = Math.max(rightMax, height[right]);\n            water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}", "go": "func trap(height []int) int {\n\tleft, right := 0, len(height)-1\n\tleftMax, rightMax, water := 0, 0, 0\n\tfor left < right {\n\t\tif height[left] < height[right] {\n\t\t\tleftMax = max(leftMax, height[left])\n\t\t\twater += leftMax - height[left]\n\t\t\tleft++\n\t\t} else {\n\t\t\trightMax = max(rightMax, height[right])\n\t\t\twater += rightMax - height[right]\n\t\t\tright--\n\t\t}\n\t}\n\treturn water\n}"}$bm$::jsonb,
  'published', now() - interval '3 days'
);
insert into public.dsa_problems (slug, title, category_id, topic, difficulty, problem_statement, status)
values ('draft-reverse-linked-list', 'Reverse a Linked List (draft)',
  (select id from public.categories where slug = 'dsa'), 'linked-lists', 'easy',
  'Not ready yet. This draft exists to prove drafts stay hidden.', 'draft');

-- Interview questions.
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$node-event-loop$bm$, $bm$What is the event loop in Node.js?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$Node.js$bm$, $bm$Concurrency$bm$, $bm$Concepts$bm$, 'medium',
  $bm$It's the loop that lets a single JavaScript thread handle many operations at once. Slow work like I/O is handed off, and its callback runs when the result is ready and the call stack is empty.$bm$,
  $bm$Node runs your JavaScript on one thread. Network and most file operations are delegated to the operating system or a small thread pool, so that thread is free in the meantime.

The loop moves through phases: timers, pending callbacks, poll, check and close. Between callbacks, it drains the microtask queue, which holds resolved promises and `process.nextTick` callbacks.$bm$,
  $bm$A CPU-heavy loop in a request handler blocks every other request, because nothing else can run on that thread. Move that work to a worker thread or another service.$bm$,
  $bm$setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('sync');
// sync, promise, timeout$bm$, $bm$javascript$bm$,
  'published', now() - interval '1 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$js-promise-all-vs-allsettled$bm$, $bm$What is the difference between Promise.all and Promise.allSettled?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$JavaScript$bm$, $bm$Async$bm$, $bm$Concepts$bm$, 'easy',
  $bm$`Promise.all` rejects as soon as any promise rejects. `Promise.allSettled` always waits for every promise and reports each outcome.$bm$,
  $bm$Use `Promise.all` when the results only make sense together, since one failure makes the whole thing useless. Use `Promise.allSettled` when partial success is still useful.

Neither cancels the other promises. After `Promise.all` rejects, the remaining work keeps running.$bm$,
  $bm$Loading a page's required data suits `Promise.all`. Sending notifications to ten users suits `Promise.allSettled`, because one bad address shouldn't hide the other nine results.$bm$,
  $bm$const results = await Promise.allSettled(users.map(notify));
const failed = results.filter((result) => result.status === 'rejected');$bm$, $bm$javascript$bm$,
  'published', now() - interval '2 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$ts-unknown-vs-any$bm$, $bm$When should you use unknown instead of any in TypeScript?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$TypeScript$bm$, $bm$Type system$bm$, $bm$Concepts$bm$, 'easy',
  $bm$Use `unknown` for values whose type you don't know yet. It forces you to check the type before using it, while `any` turns type checking off.$bm$,
  $bm$`any` spreads: anything assigned from it is unchecked too, so a single `any` can silently disable checks far away. `unknown` accepts any value but allows nothing to be done with it until it's narrowed.$bm$,
  $bm$Parsed JSON and caught errors should be `unknown` until validated, for example with a Zod schema or a type guard.$bm$,
  $bm$function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}$bm$, $bm$typescript$bm$,
  'published', now() - interval '3 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$go-goroutine-leak$bm$, $bm$What causes a goroutine leak, and how do you prevent one?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$Golang$bm$, $bm$Concurrency$bm$, $bm$Scenario$bm$, 'medium',
  $bm$A goroutine leaks when it blocks forever, usually on a channel nobody will use again. Prevent it by giving every goroutine a way to stop, typically with a `context`.$bm$,
  $bm$Goroutines aren't garbage collected while blocked, so a leaked one keeps its stack and everything it references. Memory and goroutine counts then climb slowly until the process restarts.

The classic case is a sender on an unbuffered channel whose receiver already returned after a timeout.$bm$,
  $bm$Watch the goroutine count in production with `runtime.NumGoroutine` or pprof. A count that only ever goes up is the signature of a leak.$bm$,
  $bm$select {
case results <- value:
case <-ctx.Done():
	return ctx.Err()
}$bm$, $bm$go$bm$,
  'published', now() - interval '4 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$java-hashmap-internals$bm$, $bm$How does HashMap work internally in Java?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$Java$bm$, $bm$Collections$bm$, $bm$Concepts$bm$, 'medium',
  $bm$It's an array of buckets. A key's `hashCode` picks the bucket, and `equals` finds the entry inside it. Lookups average O(1).$bm$,
  $bm$Keys that collide share a bucket, stored as a linked list that converts to a red-black tree at 8 entries when the table is large enough, which bounds the worst case at O(log n).

When the size passes capacity × load factor (0.75 by default), the table doubles and entries are redistributed.$bm$,
  $bm$A key whose `hashCode` changes after insertion becomes unfindable, so use immutable keys. `HashMap` also isn't thread-safe: use `ConcurrentHashMap` for shared access.$bm$,
  null, null,
  'published', now() - interval '5 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$aws-sqs-visibility-timeout$bm$, $bm$What is the SQS visibility timeout?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$AWS$bm$, $bm$Messaging$bm$, $bm$Concepts$bm$, 'easy',
  $bm$It's how long a message stays hidden after a consumer receives it. If the consumer doesn't delete it in time, the message becomes visible and is delivered again.$bm$,
  $bm$SQS has no acknowledgement other than deleting the message. The timeout stands in for one: a crashed consumer simply never deletes, so another consumer picks the message up.

Set it longer than your processing time, or the same message runs twice at once. For long jobs, extend it with `ChangeMessageVisibility` while working.$bm$,
  $bm$A standard queue delivers at least once, so handlers must be idempotent anyway. Add a dead-letter queue so a message that keeps failing doesn't retry forever.$bm$,
  null, null,
  'published', now() - interval '6 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$system-design-cache-stampede$bm$, $bm$What is a cache stampede?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$System Design$bm$, $bm$Caching$bm$, $bm$Scenario$bm$, 'medium',
  $bm$A popular key expires and many requests miss it at once, so they all hit the database together. Prevent it by coalescing concurrent requests, adding jitter to expiry times, or refreshing the key before it expires.$bm$,
  $bm$The database sees a sudden spike at exactly the moment the cache stops protecting it, and slow responses make the spike last longer. Under enough load, it can take the database down.

Coalescing lets one request rebuild the value while the rest wait for it. Jitter stops many keys expiring together. Early refresh rebuilds the value before anyone misses.$bm$,
  $bm$Serving slightly stale data during the rebuild is often the best trade-off for read-heavy pages.$bm$,
  null, null,
  'published', now() - interval '7 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, interview_category, difficulty, short_answer,
   detailed_explanation, practical_example, code_example, code_language, status, published_at)
values (
  $bm$database-index-tradeoffs$bm$, $bm$Why not add an index to every column?$bm$,
  (select id from public.categories where slug = 'interview-questions'),
  $bm$Database$bm$, $bm$Indexing$bm$, $bm$Concepts$bm$, 'easy',
  $bm$Every index speeds up some reads but slows down every write to its table, and it uses storage. Add indexes for queries you actually run.$bm$,
  $bm$An `INSERT` has to update every index on the table, and an `UPDATE` must update those covering changed columns. Indexes also compete for memory with your data.

The planner may ignore an index on a column with few distinct values, since scanning the table is cheaper. In a composite index, column order decides which queries it can serve.$bm$,
  $bm$Use `EXPLAIN ANALYZE` to confirm a query uses the index, and remove indexes that usage statistics show are never scanned.$bm$,
  $bm$EXPLAIN ANALYZE
SELECT * FROM orders
WHERE customer_id = 42 AND created_at > now() - interval '7 days';$bm$, $bm$sql$bm$,
  'published', now() - interval '8 days'
);
insert into public.interview_questions
  (slug, title, category_id, technology, topic, difficulty, short_answer, status)
values ('draft-node-streams', 'How do Node.js streams apply backpressure? (draft)',
  (select id from public.categories where slug = 'interview-questions'),
  'Node.js', 'Streams', 'hard', 'Not ready yet.', 'draft');
update public.interview_questions set related_question_ids = array[(select id from public.interview_questions where slug = 'js-promise-all-vs-allsettled')] where slug = 'node-event-loop';
update public.interview_questions set related_question_ids = array[(select id from public.interview_questions where slug = 'node-event-loop')] where slug = 'js-promise-all-vs-allsettled';

-- One article for each remaining track, tagged so its topic links work.
insert into public.articles
  (slug, title, description, content, category_id, author_id, reading_time_minutes, difficulty, status, published_at)
values (
  $bm$rate-limiter-system-design$bm$, $bm$Design a Rate Limiter$bm$, $bm$Requirements through trade-offs for a distributed rate limiter, using a token bucket in Redis.$bm$,
  $bm$## Problem statement

An API needs to stop any one client from using more than its share. Requests over the limit should be rejected quickly, without slowing down everyone else.

## Functional requirements

- Limit requests per client, for example 100 per minute per API key.
- Allow different limits per plan.
- Return status `429` with a `Retry-After` header when a client is over its limit.

## Non-functional requirements

- Adds under 5 ms to each request.
- Limits hold across every API server, not per server.
- If the limiter fails, the API keeps serving. A short period without limits beats an outage.

## Architecture diagram

```mermaid
flowchart LR
  C[Client] --> G[API gateway]
  G --> L[Rate limiter]
  L --> R[(Redis)]
  G --> S[API servers]
```

## API design

The limiter isn't called directly. It adds headers to every response:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
Retry-After: 12
```

## Database design

Each bucket is a Redis hash with an expiry, so idle clients cost nothing.

| Key | Fields | Expiry |
| --- | --- | --- |
| `rl:{apiKey}` | `tokens`, `updatedAt` | Time to refill completely |

Plans and their limits live in PostgreSQL and are cached in each gateway.

## Component explanation

- **API gateway:** the one place every request passes through.
- **Rate limiter:** implements the **token bucket**. A bucket refills at a steady rate, and each request takes one token. That allows short bursts while holding the average.
- **Redis:** holds the counters that all gateways share. A Lua script does the read and the write in one atomic step. Without it, two servers can spend the same token.

## Scaling strategy

Shard Redis by client key, so each client always maps to one shard. Most checks then stay fast as traffic grows, since each one touches a single key.

## Bottlenecks

- **Redis latency:** every request pays for a round trip. Use a short timeout and fail open.
- **Hot keys:** one very busy client can load one shard. A small local allowance in each gateway reduces how often it calls Redis.

## Trade-offs

| Choice | Gain | Cost |
| --- | --- | --- |
| Token bucket over fixed window | No burst at window edges | Slightly more state |
| Central Redis over per-server counters | Accurate limits | A network call per request |
| Fail open over fail closed | Stays available | Limits lapse during an outage |
$bm$,
  (select id from public.categories where slug = 'system-design'),
  '10000000-0000-0000-0000-00000000000a', 7, 'medium', 'published', now() - interval '5 days'
);
insert into public.article_tags (article_id, tag_id)
select (select id from public.articles where slug = 'rate-limiter-system-design'), id from public.tags where slug in ('rate-limiter');
insert into public.articles
  (slug, title, description, content, category_id, author_id, reading_time_minutes, difficulty, status, published_at)
values (
  $bm$strategy-pattern-in-practice$bm$, $bm$The Strategy Pattern in Practice$bm$, $bm$Replace growing conditionals with interchangeable behaviour, using payment methods as the example.$bm$,
  $bm$## The problem

A checkout starts with one payment method. Each new method then adds another branch:

```typescript
if (method === 'card') {
  // charge the card
} else if (method === 'upi') {
  // collect through UPI
}
```

Every addition edits working code, and the tests for each branch all live in one place. This breaks the **open/closed principle**: code should be open to extension but closed to modification.

## The pattern

Put each behaviour behind one interface, and let the caller depend only on that.

```mermaid
classDiagram
  class PaymentMethod {
    <<interface>>
    +charge(amount) Receipt
  }
  class CardPayment
  class UpiPayment
  class Checkout {
    +pay(amount) Receipt
  }
  PaymentMethod <|.. CardPayment
  PaymentMethod <|.. UpiPayment
  Checkout --> PaymentMethod
```

## Implementation

```typescript
interface PaymentMethod {
  charge(amountInPaise: number): Promise<Receipt>;
}

class Checkout {
  constructor(private readonly method: PaymentMethod) {}

  pay(amountInPaise: number): Promise<Receipt> {
    return this.method.charge(amountInPaise);
  }
}
```

A new method is now a new class. `Checkout` and its tests don't change.

## When not to use it

With two behaviours that will never grow, an `if` is easier to read. Reach for this pattern when variations keep arriving or need testing on their own.
$bm$,
  (select id from public.categories where slug = 'lld'),
  '10000000-0000-0000-0000-00000000000a', 4, 'easy', 'published', now() - interval '6 days'
);
insert into public.article_tags (article_id, tag_id)
select (select id from public.articles where slug = 'strategy-pattern-in-practice'), id from public.tags where slug in ('design-patterns', 'payment-system', 'solid-principles');
insert into public.articles
  (slug, title, description, content, category_id, author_id, reading_time_minutes, difficulty, status, published_at)
values (
  $bm$sqs-dead-letter-queues$bm$, $bm$Reliable Processing with SQS and Dead-Letter Queues$bm$, $bm$How visibility timeouts and dead-letter queues keep one bad message from blocking the rest.$bm$,
  $bm$## What it is and when to use it

Amazon SQS is a managed queue. Use it when a producer shouldn't wait for slow work, or when traffic spikes need smoothing out.

## Architecture diagram

```mermaid
flowchart LR
  A[API] --> Q[SQS queue]
  Q --> W[Worker]
  Q -- after 5 failed receives --> D[Dead-letter queue]
  D --> AL[CloudWatch alarm]
```

## Practical example

A worker deletes a message only after it succeeds. If it crashes, the message reappears when the visibility timeout ends and another worker retries it.

```typescript
const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({ QueueUrl, WaitTimeSeconds: 20 }));

for (const message of Messages) {
  await handle(message); // Must be safe to run twice.
  await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: message.ReceiptHandle }));
}
```

## Infrastructure as code

```
resource "aws_sqs_queue" "orders" {
  visibility_timeout_seconds = 60
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.orders_dlq.arn
    maxReceiveCount     = 5
  })
}
```

## Limits and cost

- Messages have a size limit, so store large payloads in S3 and queue a pointer to them.
- Long polling (`WaitTimeSeconds`) cuts the number of empty, billed requests.

## Failure modes

> [!WARNING]
> Standard queues deliver at least once and don't guarantee order. Handlers have to be idempotent.

- **Timeout shorter than the work:** the same message runs twice at once.
- **No dead-letter queue:** a message that always fails keeps retrying until it expires.
- **No alarm on the dead-letter queue:** failures pile up unnoticed.
$bm$,
  (select id from public.categories where slug = 'aws'),
  '10000000-0000-0000-0000-00000000000a', 5, 'medium', 'published', now() - interval '7 days'
);
insert into public.article_tags (article_id, tag_id)
select (select id from public.articles where slug = 'sqs-dead-letter-queues'), id from public.tags where slug in ('sqs', 'message-queues');
insert into public.articles
  (slug, title, description, content, category_id, author_id, reading_time_minutes, difficulty, status, published_at)
values (
  $bm$sli-slo-sla-explained$bm$, $bm$SLI, SLO and SLA, Explained$bm$, $bm$What each one means, how to work out an error budget, and what to alert on.$bm$,
  $bm$## The core concept

- **SLI (indicator):** a measurement, such as the share of requests that succeed.
- **SLO (objective):** your internal target for it, such as 99.9% over 30 days.
- **SLA (agreement):** a contract with customers, with consequences if it's missed.

An SLA should be looser than its SLO, so you notice and react before you owe anyone anything.

## Why it matters in production

An SLO turns "is the system reliable enough?" into a number, which settles arguments about whether to ship features or fix stability.

## Practical example

A 99.9% objective over 30 days allows this much failure:

| Period | Minutes | Error budget at 99.9% |
| --- | --- | --- |
| 30 days | 43,200 | 43.2 minutes |

If an incident burns 30 of those minutes, 13.2 remain. Teams often slow risky releases until the budget recovers.

## Architecture diagram

```mermaid
flowchart LR
  S[Service] --> P[Prometheus]
  P --> R[SLO rules]
  R --> G[Grafana]
  R --> A[Alertmanager]
```

## What to alert on

Alert on how fast the budget is burning, not on every error. A burn rate of 14.4 uses 2% of a 30-day budget in one hour, which is worth waking someone up for.

## Common mistakes

- Aiming for 100%, which leaves no room to change anything.
- Choosing SLIs that are easy to measure instead of ones users notice.
- Setting an SLA equal to the SLO, which leaves no margin.
$bm$,
  (select id from public.categories where slug = 'observability'),
  '10000000-0000-0000-0000-00000000000a', 5, 'easy', 'published', now() - interval '8 days'
);
insert into public.article_tags (article_id, tag_id)
select (select id from public.articles where slug = 'sli-slo-sla-explained'), id from public.tags where slug in ('sli-slo-sla', 'alerting', 'reliability');
insert into public.articles
  (slug, title, description, content, category_id, author_id, reading_time_minutes, difficulty, status, published_at)
values (
  $bm$idempotency-keys-for-safe-retries$bm$, $bm$Idempotency Keys for Safe Retries$bm$, $bm$Make a payment API safe to retry, so a timeout never charges a customer twice.$bm$,
  $bm$## The problem

A client sends a payment and the connection drops before the response arrives. It can't tell whether the charge happened. Retrying might charge twice, and not retrying might lose the order.

## The core concept

The client generates a unique key for each logical operation and sends it with every attempt. The server does the work once and replays the stored result for repeats.

## Working code

A unique constraint decides the winner, so this stays correct when two attempts arrive together.

```sql
CREATE TABLE idempotency_keys (
  key text PRIMARY KEY,
  request_hash text NOT NULL,
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

```typescript
const inserted = await db.tryInsertKey(key, hash(request));

if (!inserted) {
  const existing = await db.findKey(key);
  if (existing.requestHash !== hash(request)) throw new ConflictError();
  return existing.response ?? retryLater();
}

const response = await charge(request);
await db.saveResponse(key, response);
return response;
```

## Failure modes

- **Crash between the charge and saving the response:** the key exists with no response. Pass your key to the payment provider too, so its side is protected as well.
- **Same key, different body:** this is a client bug, so reject it rather than replaying the wrong result.

## How to test it

Send the same request twice in parallel, and assert that one charge happened and both callers got the same response.

## Production checklist

- Expire keys after a set period, such as 24 hours.
- Scope keys per customer, so one customer's key can't read another's response.
- Return the original status code on a replay.
$bm$,
  (select id from public.categories where slug = 'backend-engineering'),
  '10000000-0000-0000-0000-00000000000a', 5, 'medium', 'published', now() - interval '9 days'
);
insert into public.article_tags (article_id, tag_id)
select (select id from public.articles where slug = 'idempotency-keys-for-safe-retries'), id from public.tags where slug in ('idempotency', 'rest-api-design', 'payment-system');

-- Interactive explainers inside two existing articles.
update public.articles set content = content || E'\n\n## See it working\n\n```explainer\nload-balancer\n```\n'
where slug = 'how-load-balancers-distribute-traffic';
update public.articles set content = content || E'\n\n## See it working\n\n```explainer\ncaching\n```\n'
where slug = 'cache-stampede-explained';

