import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { Notice } from './field';
import { StateBadge } from './state-badge';
import type { EditorMessage } from './use-learning-editor';

export function LearningEditorHeader({
  title,
  status,
  liveHref,
  dirty,
  busy,
  message,
  onPublish,
  onUnpublish,
}: {
  title: string;
  status: 'draft' | 'published';
  liveHref?: string;
  dirty: boolean;
  busy: boolean;
  message: EditorMessage | null;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          <StateBadge state={status} />
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {liveHref && (
            <Link
              href={liveHref}
              target="_blank"
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              View live
            </Link>
          )}
          <button
            type="submit"
            disabled={busy}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            {status === 'draft' ? 'Save draft' : 'Save'}
          </button>
          {status === 'published' ? (
            <button
              type="button"
              disabled={busy}
              onClick={onUnpublish}
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onPublish}
              className={buttonVariants({ size: 'lg' })}
            >
              Publish now
            </button>
          )}
        </div>
      </header>
      <div aria-live="polite">{message && <Notice tone={message.tone}>{message.text}</Notice>}</div>
    </>
  );
}
