'use client';

import { useEffect, useState, useTransition } from 'react';
import type { ZodType } from 'zod';
import type { ActionResult } from '../action-result';
import { toFieldErrors, type FieldErrors } from '../schemas';

export type EditorMessage = { tone: 'error' | 'warning' | 'success'; text: string };

interface SavedRecord {
  id: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

/**
 * The save and publish workflow shared by the DSA and interview question editors. Only the
 * fields differ, and those stay in each editor.
 */
export function useLearningEditor<TInput extends object, TRecord extends SavedRecord>({
  initial,
  initialInput,
  schema,
  basePath,
  actions,
}: {
  initial: TRecord | null;
  initialInput: TInput;
  schema: ZodType;
  basePath: string;
  actions: {
    save: (
      id: string | null,
      expectedUpdatedAt: string | null,
      input: TInput,
    ) => Promise<ActionResult<TRecord>>;
    publish: (id: string) => Promise<ActionResult<TRecord>>;
    unpublish: (id: string) => Promise<ActionResult<TRecord>>;
    remove: (id: string) => Promise<ActionResult>;
  };
}) {
  const [record, setRecord] = useState(initial);
  const [input, setInput] = useState(initialInput);
  const [saved, setSaved] = useState(() => JSON.stringify(initialInput));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<EditorMessage | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(input) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update<K extends keyof TInput>(key: K, value: TInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setErrors(({ [key as string]: _cleared, ...rest }) => rest);
    setMessage(null);
  }

  function report(result: ActionResult<TRecord>, success: string): TRecord | null {
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setMessage({ tone: 'error', text: result.error });
      return null;
    }
    setRecord(result.data);
    setMessage(
      result.warning
        ? { tone: 'warning', text: result.warning }
        : { tone: 'success', text: success },
    );
    return result.data;
  }

  async function persist(): Promise<TRecord | null> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setMessage({ tone: 'error', text: 'Fix the highlighted fields.' });
      return null;
    }
    const result = await actions.save(record?.id ?? null, record?.updatedAt ?? null, input);
    const savedRecord = report(result, 'Saved.');
    if (savedRecord) {
      setSaved(JSON.stringify(input));
      // Moves a new record to its own address, without losing what is on screen.
      if (!record) window.history.replaceState(null, '', `${basePath}/${savedRecord.id}`);
    }
    return savedRecord;
  }

  return {
    record,
    input,
    errors,
    message,
    dirty,
    pending,
    update,
    save: () => startTransition(() => persist().then(() => undefined)),
    publish: () =>
      startTransition(async () => {
        // Publishing what's on screen, so unsaved edits go first.
        const current = dirty || !record ? await persist() : record;
        if (current) report(await actions.publish(current.id), 'Published. It is live now.');
      }),
    unpublish: () =>
      startTransition(async () => {
        if (record) {
          report(await actions.unpublish(record.id), 'Unpublished. Readers can no longer see it.');
        }
      }),
    remove: () =>
      startTransition(async () => {
        if (!record) return;
        // Redirects on success, so a result only comes back when it failed.
        const result = await actions.remove(record.id);
        if (!result.ok) setMessage({ tone: 'error', text: result.error });
      }),
  };
}
