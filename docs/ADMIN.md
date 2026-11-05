# BackendMasters — Admin Guide

The admin area is at `/admin`. It isn't linked from the public site, and search engines are told not to index it.

## Local accounts

`npm run db:reset` creates two accounts. They exist only in local databases, because `supabase db push` doesn't run the seed.

| Email                        | Password                | Role   |
| ---------------------------- | ----------------------- | ------ |
| `admin@backendmasters.test`  | `local-admin-password`  | Admin  |
| `reader@backendmasters.test` | `local-reader-password` | Reader |

## Setting up production

Do these once, on the hosted Supabase project.

1. **Turn off sign-ups.** Dashboard > Authentication > Sign In / Providers > turn off "Allow new users to sign up". `supabase/config.toml` only controls the local stack. A public sign-up could only ever create a reader, but there is no reason to allow it.
2. **Apply the migrations:** `npx supabase db push`. This also creates the image bucket and its policies.
3. **Create your account.** Dashboard > Authentication > Users > Add user, with a strong password.
4. **Make it an administrator,** in the dashboard's SQL editor:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

5. **Set the environment variables** listed in both `.env.example` files. `REVALIDATE_SECRET` must match in the web app and the API. Generate it with `openssl rand -hex 32`. The API refuses to start in production without it.

The secret key belongs on the API host only. Never add it to the web app.

## Publishing

| Action      | Effect                                                                       |
| ----------- | ---------------------------------------------------------------------------- |
| Save draft  | Nothing changes for readers                                                  |
| Publish now | Live on the next request. Needs a description and content                    |
| Schedule    | Hidden until its date. The site can take up to an hour to show it after that |
| Save        | On a published article, the live page updates on the next request            |
| Unpublish   | Back to draft, hidden on the next request. Republishing keeps the first date |
| Delete      | Permanent, after a confirmation                                              |

If the editor warns that the site could not be refreshed, the change is saved, and the site catches up within an hour.

## Known limits

- **Changing a published slug breaks links to it.** The editor warns about this, but there are no redirects yet.
- **Replaced or removed images stay in storage.** Nothing is deleted automatically, so unused files will build up slowly.
- **Scheduled articles appear late.** Nothing refreshes the site at the scheduled moment, so an article goes live for readers when the hourly cache next expires.
- **Category descriptions** are edited here, but the category pages use their own text from `features/catalog/categories.ts`. Names appear on article cards and pages.
- **No multi-factor sign-in yet.** Consider turning it on before launch, since this account can change everything on the site.
- **Sign-in attempts are rate limited by Supabase per IP address.** They all come from the web server's address, so repeated failed attempts by anyone could briefly lock out the real administrator.
