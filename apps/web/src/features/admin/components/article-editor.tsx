'use client';

import {
  Bold,
  Braces,
  Code,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  MAX_IMAGE_BYTES,
  type AdminArticle,
  type AdminCategory,
  type AdminTag,
  type ArticleInput,
  type Difficulty,
} from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import {
  deleteArticle,
  previewMarkdown,
  publishArticle,
  saveArticle,
  unpublishArticle,
  uploadImage,
} from '../actions';
import { articleSchema, toFieldErrors, type FieldErrors } from '../schemas';
import {
  missingSections,
  SYSTEM_DESIGN_CATEGORIES,
  systemDesignOutline,
} from '../system-design-outline';
import { slugify } from '../slugify';
import { ConfirmButton } from './confirm-button';
import { Field, INPUT_CLASS, Notice } from './field';
import { applyMarkdown, insertAt, type MarkdownAction, type TextEdit } from './markdown-toolbar';
import { StateBadge } from './state-badge';

const TOOLBAR: { action: MarkdownAction; label: string; icon: LucideIcon }[] = [
  { action: 'heading', label: 'Heading', icon: Heading2 },
  { action: 'bold', label: 'Bold', icon: Bold },
  { action: 'italic', label: 'Italic', icon: Italic },
  { action: 'link', label: 'Link', icon: LinkIcon },
  { action: 'list', label: 'List', icon: List },
  { action: 'code', label: 'Inline code', icon: Code },
  { action: 'codeblock', label: 'Code block', icon: Braces },
];

type Message = { tone: 'error' | 'warning' | 'success'; text: string };

function toInput(article: AdminArticle | null, categories: AdminCategory[]): ArticleInput {
  return {
    slug: article?.slug ?? '',
    title: article?.title ?? '',
    description: article?.description ?? '',
    content: article?.content ?? '',
    coverImageUrl: article?.coverImageUrl ?? null,
    categoryId: article?.categoryId ?? categories[0]?.id ?? '',
    difficulty: article?.difficulty ?? null,
    seoTitle: article?.seoTitle ?? null,
    seoDescription: article?.seoDescription ?? null,
    isFeatured: article?.isFeatured ?? false,
    tagIds: article?.tagIds ?? [],
  };
}

/** Shows a stored UTC date in the writer's own time zone, as datetime-local expects. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const noSubscription = () => () => {};

/** The server doesn't know the writer's time zone, so local times only appear in the browser. */
function useIsBrowser(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

function LocalTime({ iso }: { iso: string }) {
  const isBrowser = useIsBrowser();
  return <time dateTime={iso}>{isBrowser ? dateTimeFormat.format(new Date(iso)) : ''}</time>;
}

export function ArticleEditor({
  article: initial,
  categories,
  tags,
}: {
  article: AdminArticle | null;
  categories: AdminCategory[];
  tags: AdminTag[];
}) {
  const [article, setArticle] = useState(initial);
  const [input, setInput] = useState(() => toInput(initial, categories));
  const [saved, setSaved] = useState(() => JSON.stringify(toInput(initial, categories)));
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<Message | null>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [preview, setPreview] = useState<ReactNode>(null);
  const isBrowser = useIsBrowser();
  const [scheduleEdit, setScheduleEdit] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const contentImageInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(input) !== saved;
  const busy = pending || uploading;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update<K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setErrors(({ [key]: _cleared, ...rest }) => rest);
    setMessage(null);
  }

  function updateTitle(title: string) {
    update('title', title);
    // Only before the first save: after that, a new title must not silently change the address.
    if (!slugEdited && !article) update('slug', slugify(title));
  }

  /** Validates and saves. Returns the saved article, or null after showing what went wrong. */
  const persist = useCallback(async (): Promise<AdminArticle | null> => {
    const parsed = articleSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setMessage({ tone: 'error', text: 'Fix the highlighted fields.' });
      setMode('write');
      return null;
    }
    const result = await saveArticle(article?.id ?? null, article?.updatedAt ?? null, input);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setMessage({ tone: 'error', text: result.error });
      return null;
    }
    setArticle(result.data);
    setSaved(JSON.stringify(input));
    setMessage(
      result.warning
        ? { tone: 'warning', text: result.warning }
        : { tone: 'success', text: 'Saved.' },
    );
    return result.data;
  }, [article, input]);

  function afterSave(saved: AdminArticle) {
    // Moves a new article to its own address, without losing what is on screen.
    if (!article) window.history.replaceState(null, '', `/admin/articles/${saved.id}`);
  }

  function save() {
    startTransition(async () => {
      const result = await persist();
      if (result) afterSave(result);
    });
  }

  function publish(publishedAt?: string) {
    startTransition(async () => {
      // Publishing what's on screen, so unsaved edits go first.
      const current = dirty || !article ? await persist() : article;
      if (!current) return;
      afterSave(current);
      const result = await publishArticle(current.id, publishedAt);
      if (!result.ok) {
        setMessage({ tone: 'error', text: result.error });
        return;
      }
      setArticle(result.data);
      setMessage(
        result.warning
          ? { tone: 'warning', text: result.warning }
          : {
              tone: 'success',
              text: result.data.state === 'scheduled' ? 'Scheduled.' : 'Published. It is live now.',
            },
      );
    });
  }

  function unpublish() {
    if (!article) return;
    startTransition(async () => {
      const result = await unpublishArticle(article.id);
      if (!result.ok) {
        setMessage({ tone: 'error', text: result.error });
        return;
      }
      setArticle(result.data);
      setMessage(
        result.warning
          ? { tone: 'warning', text: result.warning }
          : { tone: 'success', text: 'Unpublished. Readers can no longer see it.' },
      );
    });
  }

  function remove() {
    if (!article) return;
    startTransition(async () => {
      // Redirects on success, so a result only comes back when it failed.
      const result = await deleteArticle(article.id);
      if (!result.ok) setMessage({ tone: 'error', text: result.error });
    });
  }

  function showPreview() {
    setMode('preview');
    setPreview(null);
    startTransition(async () => {
      const result = await previewMarkdown(input.content);
      if (result.ok) setPreview(result.data);
      else setMessage({ tone: 'error', text: result.error });
    });
  }

  function applyEdit(edit: TextEdit) {
    update('content', edit.value);
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  }

  function format(action: MarkdownAction) {
    const element = textarea.current;
    if (!element) return;
    applyEdit(applyMarkdown(input.content, element.selectionStart, element.selectionEnd, action));
  }

  function insertOutline() {
    const separator = input.content.trim() ? '\n\n' : '';
    update('content', `${input.content.trimEnd()}${separator}${systemDesignOutline()}`);
    setMode('write');
  }

  function handleEditorKeys(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'b' || key === 'i') {
      event.preventDefault();
      format(key === 'b' ? 'bold' : 'italic');
    }
  }

  async function upload(file: File): Promise<string | null> {
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage({ tone: 'error', text: 'Images can be up to 5 MB.' });
      return null;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      const result = await uploadImage(form);
      if (result.ok) return result.data.url;
      setMessage({ tone: 'error', text: result.error });
      return null;
    } catch {
      setMessage({ tone: 'error', text: 'The image could not be uploaded.' });
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = await upload(file);
    if (url) update('coverImageUrl', url);
  }

  async function uploadContentImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const position = textarea.current?.selectionStart ?? input.content.length;
    const url = await upload(file);
    if (url) applyEdit(insertAt(input.content, position, `![Describe this image](${url})`));
  }

  function handleShortcut(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (!busy) save();
    }
  }

  const state = article?.state ?? 'draft';
  const categorySlug = categories.find((category) => category.id === input.categoryId)?.slug ?? '';
  const missing = SYSTEM_DESIGN_CATEGORIES.includes(categorySlug)
    ? missingSections(input.content)
    : null;
  const scheduleAt =
    scheduleEdit ??
    (isBrowser && state === 'scheduled' ? toLocalInput(article?.publishedAt ?? null) : '');

  return (
    <form
      noValidate
      onKeyDown={handleShortcut}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {article ? 'Edit article' : 'New article'}
          </h1>
          <StateBadge state={state} />
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {article && state === 'published' && (
            <Link
              href={`/articles/${article.slug}`}
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
            {state === 'draft' ? 'Save draft' : 'Save'}
          </button>
          {state === 'published' ? (
            <button
              type="button"
              disabled={busy}
              onClick={unpublish}
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => publish()}
              className={buttonVariants({ size: 'lg' })}
            >
              Publish now
            </button>
          )}
        </div>
      </header>

      <div aria-live="polite">{message && <Notice tone={message.tone}>{message.text}</Notice>}</div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Field id="title" label="Title" error={errors.title}>
            <input
              id="title"
              value={input.title}
              onChange={(event) => updateTitle(event.target.value)}
              aria-invalid={Boolean(errors.title)}
              className={cn(INPUT_CLASS, 'font-heading text-lg')}
            />
          </Field>
          <Field
            id="slug"
            label="Slug"
            error={errors.slug}
            hint={
              state !== 'draft' && article && input.slug !== article.slug
                ? 'Changing this breaks existing links to the article.'
                : `/articles/${input.slug || '…'}`
            }
          >
            <input
              id="slug"
              value={input.slug}
              onChange={(event) => {
                setSlugEdited(true);
                update('slug', event.target.value);
              }}
              aria-invalid={Boolean(errors.slug)}
              className={cn(INPUT_CLASS, 'font-mono')}
            />
          </Field>
          <Field id="description" label="Description" error={errors.description}>
            <textarea
              id="description"
              rows={2}
              value={input.description}
              onChange={(event) => update('description', event.target.value)}
              aria-invalid={Boolean(errors.description)}
              className={INPUT_CLASS}
            />
          </Field>

          <section aria-label="Content" className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
              <div role="group" aria-label="Editor mode" className="flex gap-1">
                <button
                  type="button"
                  aria-pressed={mode === 'write'}
                  onClick={() => setMode('write')}
                  className={buttonVariants({
                    variant: mode === 'write' ? 'secondary' : 'ghost',
                    size: 'sm',
                  })}
                >
                  Write
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'preview'}
                  onClick={showPreview}
                  className={buttonVariants({
                    variant: mode === 'preview' ? 'secondary' : 'ghost',
                    size: 'sm',
                  })}
                >
                  Preview
                </button>
              </div>
              {mode === 'write' && (
                <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5">
                  {TOOLBAR.map(({ action, label, icon: Icon }) => (
                    <button
                      key={action}
                      type="button"
                      aria-label={label}
                      title={label}
                      onClick={() => format(action)}
                      className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                    >
                      <Icon aria-hidden />
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Insert image"
                    title="Insert image"
                    disabled={busy}
                    onClick={() => contentImageInput.current?.click()}
                    className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                  >
                    <ImagePlus aria-hidden />
                  </button>
                  <input
                    ref={contentImageInput}
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/webp"
                    onChange={uploadContentImage}
                  />
                </div>
              )}
            </div>
            {mode === 'write' ? (
              <textarea
                ref={textarea}
                aria-label="Article content in Markdown"
                value={input.content}
                onChange={(event) => update('content', event.target.value)}
                onKeyDown={handleEditorKeys}
                spellCheck
                placeholder="Write in Markdown. Code fences, tables, notes and Mermaid diagrams all work."
                className="block min-h-[32rem] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
              />
            ) : (
              <div className="min-h-[32rem] p-4 sm:p-6">
                {preview ?? <p className="text-sm text-muted-foreground">Rendering…</p>}
              </div>
            )}
          </section>
          {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
        </div>

        <aside className="space-y-5">
          <Panel title="Publishing">
            {state === 'published' && article?.publishedAt && (
              <p className="text-sm text-muted-foreground">
                Live since <LocalTime iso={article.publishedAt} />
              </p>
            )}
            {state === 'scheduled' && article?.publishedAt && (
              <p className="text-sm text-muted-foreground">
                Goes live <LocalTime iso={article.publishedAt} />. The site can take up to an hour
                to show it.
              </p>
            )}
            {state !== 'published' && (
              <Field id="schedule" label="Schedule for later" hint="In your local time.">
                <input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(event) => setScheduleEdit(event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            )}
            {state !== 'published' && (
              <button
                type="button"
                disabled={busy || !scheduleAt}
                onClick={() => publish(new Date(scheduleAt).toISOString())}
                className={buttonVariants({ variant: 'outline', className: 'w-full' })}
              >
                Schedule
              </button>
            )}
            {state === 'scheduled' && (
              <button
                type="button"
                disabled={busy}
                onClick={unpublish}
                className={buttonVariants({ variant: 'ghost', className: 'w-full' })}
              >
                Back to draft
              </button>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={input.isFeatured}
                onChange={(event) => update('isFeatured', event.target.checked)}
                className="size-4 accent-primary"
              />
              Feature on the homepage
            </label>
          </Panel>

          <Panel title="Classification">
            <Field id="category" label="Category" error={errors.categoryId}>
              <select
                id="category"
                value={input.categoryId}
                onChange={(event) => update('categoryId', event.target.value)}
                className={INPUT_CLASS}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="difficulty" label="Difficulty">
              <select
                id="difficulty"
                value={input.difficulty ?? ''}
                onChange={(event) =>
                  update('difficulty', (event.target.value || null) as Difficulty | null)
                }
                className={INPUT_CLASS}
              >
                <option value="">Not set</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Tags</legend>
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tags yet. Add them under Categories &amp; tags.
                </p>
              ) : (
                <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={input.tagIds.includes(tag.id)}
                        onChange={(event) =>
                          update(
                            'tagIds',
                            event.target.checked
                              ? [...input.tagIds, tag.id]
                              : input.tagIds.filter((id) => id !== tag.id),
                          )
                        }
                        className="size-4 accent-primary"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              )}
              {errors.tagIds && <p className="text-xs text-destructive">{errors.tagIds}</p>}
            </fieldset>
          </Panel>

          {missing && (
            <Panel title="System design format">
              {missing.length === 0 ? (
                <p className="text-sm">All ten sections are here.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {missing.length} of 10 sections have no heading yet:
                  </p>
                  <ul className="list-disc space-y-0.5 pl-5 text-sm">
                    {missing.map((section) => (
                      <li key={section}>{section}</li>
                    ))}
                  </ul>
                  {missing.length === 10 && (
                    <button
                      type="button"
                      onClick={insertOutline}
                      className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                    >
                      Insert outline
                    </button>
                  )}
                </>
              )}
            </Panel>
          )}

          <Panel title="Cover image">
            {input.coverImageUrl && (
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={input.coverImageUrl}
                  alt="Current cover"
                  fill
                  sizes="20rem"
                  className="object-cover"
                />
              </div>
            )}
            <label
              className={buttonVariants({
                variant: 'outline',
                className: cn('w-full cursor-pointer', busy && 'pointer-events-none opacity-50'),
              })}
            >
              {uploading ? 'Uploading…' : input.coverImageUrl ? 'Replace image' : 'Upload image'}
              <input
                type="file"
                className="sr-only"
                disabled={busy}
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadCover}
              />
            </label>
            {input.coverImageUrl && (
              <button
                type="button"
                onClick={() => update('coverImageUrl', null)}
                className={buttonVariants({ variant: 'ghost', className: 'w-full' })}
              >
                Remove image
              </button>
            )}
            <p className="text-xs text-muted-foreground">PNG, JPEG or WebP, up to 5 MB.</p>
          </Panel>

          <Panel title="Search appearance">
            <Field
              id="seoTitle"
              label="SEO title"
              error={errors.seoTitle}
              hint="Leave blank to use the title."
            >
              <input
                id="seoTitle"
                value={input.seoTitle ?? ''}
                onChange={(event) => update('seoTitle', event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field
              id="seoDescription"
              label="SEO description"
              error={errors.seoDescription}
              hint="Leave blank to use the description."
            >
              <textarea
                id="seoDescription"
                rows={3}
                value={input.seoDescription ?? ''}
                onChange={(event) => update('seoDescription', event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </Panel>

          {article && (
            <ConfirmButton
              label="Delete article"
              title="Delete this article?"
              description={`“${article.title}” will be permanently deleted. This can't be undone.`}
              confirmLabel="Delete permanently"
              disabled={busy}
              onConfirm={remove}
            />
          )}
        </aside>
      </div>
    </form>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}
