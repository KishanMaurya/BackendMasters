'use client';

import { useState, useTransition } from 'react';
import type { AdminCategory, AdminTag } from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { createTag, deleteTag, saveCategory, updateTag } from '../actions';
import type { ActionResult } from '../action-result';
import { slugify } from '../slugify';
import { ConfirmButton } from './confirm-button';
import { Field, INPUT_CLASS, Notice } from './field';

type Message = { tone: 'error' | 'warning' | 'success'; text: string };

function toMessage(result: ActionResult<unknown>, success: string): Message {
  if (!result.ok) {
    const firstField = Object.values(result.fieldErrors ?? {})[0];
    return { tone: 'error', text: firstField ?? result.error };
  }
  return result.warning
    ? { tone: 'warning', text: result.warning }
    : { tone: 'success', text: success };
}

export function CategoryEditor({ category }: { category: AdminCategory }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();
  const prefix = `category-${category.slug}`;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveCategory(category.id, {
            name,
            description,
            sortOrder: Number(sortOrder),
          });
          setMessage(toMessage(result, 'Saved.'));
        });
      }}
      className="space-y-3 rounded-xl border bg-card p-4"
    >
      <p className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>/{category.slug}</span>
        <span>{category.articleCount} published</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_6rem]">
        <Field id={`${prefix}-name`} label="Name">
          <input
            id={`${prefix}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <Field id={`${prefix}-order`} label="Order">
          <input
            id={`${prefix}-order`}
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
      </div>
      <Field id={`${prefix}-description`} label="Description">
        <textarea
          id={`${prefix}-description`}
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={INPUT_CLASS}
        />
      </Field>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Save
      </button>
    </form>
  );
}

export function TagManager({ tags }: { tags: AdminTag[] }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await createTag({ name, slug: slugify(name) });
            setMessage(toMessage(result, `Added “${name.trim()}”.`));
            if (result.ok) setName('');
          });
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4"
      >
        <Field id="new-tag" label="New tag" className="min-w-48 flex-1">
          <input
            id="new-tag"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className={buttonVariants({ size: 'lg', className: 'h-9.5' })}
        >
          Add tag
        </button>
      </form>
      <div aria-live="polite">{message && <Notice tone={message.tone}>{message.text}</Notice>}</div>
      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tags yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onMessage={setMessage} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TagRow({ tag, onMessage }: { tag: AdminTag; onMessage: (message: Message) => void }) {
  const [name, setName] = useState(tag.name);
  const [pending, startTransition] = useTransition();
  const uses = tag.articleCount === 1 ? '1 article' : `${tag.articleCount} articles`;

  return (
    <li className="flex flex-wrap items-center gap-2 p-3">
      <input
        aria-label={`Name of tag ${tag.name}`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={`${INPUT_CLASS} min-w-40 flex-1`}
      />
      <span className="w-24 font-mono text-xs text-muted-foreground">{uses}</span>
      <button
        type="button"
        disabled={pending || name.trim() === tag.name || !name.trim()}
        onClick={() =>
          startTransition(async () => {
            // The slug stays, so links to this tag's listing keep working.
            const result = await updateTag(tag.id, { name, slug: tag.slug });
            onMessage(toMessage(result, 'Renamed.'));
          })
        }
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Rename
      </button>
      <ConfirmButton
        label="Delete"
        title={`Delete “${tag.name}”?`}
        description={`It will be removed from ${uses}. The articles themselves stay.`}
        confirmLabel="Delete tag"
        disabled={pending}
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteTag(tag.id);
            onMessage(toMessage(result, 'Deleted.'));
          })
        }
      />
    </li>
  );
}
