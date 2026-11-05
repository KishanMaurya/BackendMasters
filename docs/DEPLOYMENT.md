# BackendMasters — Deployment

Nothing here has been run against real hosting yet. The Docker image and production settings were tested locally against local Supabase. `apps/web/vercel.json` and the steps below have not been tried on Vercel or a hosted Supabase project.

## What runs where

| Part                   | Host                                     | Address                 |
| ---------------------- | ---------------------------------------- | ----------------------- |
| Web                    | Vercel                                   | `backendmasters.in`     |
| API                    | Any always-on host that runs a container | `api.backendmasters.in` |
| Database, auth, images | Supabase, in Mumbai (`ap-south-1`)       | Supabase's own          |

Keep the API and Supabase in the same region, because every API call pays the distance between them.

## Order

Each step needs the one before it.

### 1. Supabase

Create the project, then follow "Setting up production" in `ADMIN.md`: turn off sign-ups, apply the migrations, and create your administrator.

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

```bash
npx supabase db push
```

### 2. API

Build the image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t backendmasters-api .
```

Run it with these settings. It refuses to start in production if any is missing.

| Setting                    | Value                                      |
| -------------------------- | ------------------------------------------ |
| `SUPABASE_URL`             | Project URL                                |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key                            |
| `SUPABASE_SECRET_KEY`      | Secret key. This host only, never Vercel   |
| `CORS_ORIGINS`             | `https://backendmasters.in`                |
| `WEB_REVALIDATE_URL`       | `https://backendmasters.in/api/revalidate` |
| `REVALIDATE_SECRET`        | Generate with `openssl rand -hex 32`       |

`NODE_ENV=production` is already set in the image, and it listens on port 4000 unless `PORT` says otherwise. The container's health check is `GET /api/v1/health`. Swagger is off in production unless `SWAGGER_ENABLED=true`.

Run one instance to begin with. More would each check scheduled articles separately, which is harmless.

### 3. Web

Create a Vercel project with the root directory `apps/web`. `vercel.json` installs and builds from the repository root.

| Setting                                | Value                                  |
| -------------------------------------- | -------------------------------------- |
| `API_URL`                              | `https://api.backendmasters.in/api/v1` |
| `NEXT_PUBLIC_SITE_URL`                 | `https://backendmasters.in`            |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key                        |
| `REVALIDATE_SECRET`                    | The same value as on the API           |

`NEXT_PUBLIC_SITE_URL` goes into canonical addresses, the sitemap and structured data. If it's wrong, search engines are told the wrong address, so check it first if anything looks off. Set the API's address before the first build, because the build prerenders published content. A build with the API down still succeeds, and pages catch up within about a minute of it returning.

### 4. Domains

Point `backendmasters.in` at Vercel and `api.backendmasters.in` at the API host. Both need HTTPS: the sign-in cookie is only sent over a secure connection in production.

## Check after deploying

1. `https://api.backendmasters.in/api/v1/health` reports Supabase as `ok`.
2. Sign in at `/admin`, publish a test article, and confirm it appears on the site on the next load.
3. In the editor, you don't see "the live site could not be refreshed". If you do, `WEB_REVALIDATE_URL` or `REVALIDATE_SECRET` is wrong.
4. `/sitemap.xml` lists the article with the real domain.
5. Upload a cover image, and confirm it shows on the published page.
6. Unpublish and delete the test article.
7. Submit `https://backendmasters.in/sitemap.xml` in Google Search Console.

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and on `master`, using no secrets:

- Formatting, lint, types, unit and integration tests, and a build.
- Access rules and the API against a real local Supabase, started inside the job.
