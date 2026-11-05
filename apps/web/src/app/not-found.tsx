import { NotFoundContent } from '@/components/layout/not-found-content';
import { SiteShell } from '@/components/layout/site-shell';

/** For URLs matching no route. These render outside the site layout, so they bring the shell. */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
