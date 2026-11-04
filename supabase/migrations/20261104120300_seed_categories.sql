-- The eight learning categories. These are reference data, so they ship to every environment.
-- Slugs must match CATEGORY_SLUGS in packages/shared/src/content.ts.

insert into public.categories (slug, name, description, sort_order) values
  ('dsa', 'DSA & Algorithms', 'Patterns that make hard problems familiar, from brute force to optimal.', 1),
  ('lld', 'Low-Level Design', 'Turn requirements into clean classes, relationships and patterns.', 2),
  ('hld', 'High-Level Design', 'The building blocks of large systems, and when each one earns its place.', 3),
  ('system-design', 'System Design', 'End-to-end case studies, from requirements to bottlenecks and trade-offs.', 4),
  ('aws', 'AWS & Cloud', 'Core AWS services explained through the architectures they belong in.', 5),
  ('observability', 'Observability', 'Logs, metrics and traces that tell you what production is really doing.', 6),
  ('backend-engineering', 'Backend Engineering', 'Practical tutorials on the APIs, databases and jobs behind real products.', 7),
  ('interview-questions', 'Interview Preparation', 'The most asked questions, with short answers and deeper explanations.', 8);
