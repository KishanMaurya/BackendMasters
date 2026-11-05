'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import {
  DSA_TOPICS,
  SOLUTION_LANGUAGES,
  type AdminDsaProblem,
  type Difficulty,
  type DsaExample,
  type DsaProblemInput,
  type DsaTopic,
  type SolutionLanguage,
} from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import {
  deleteDsaProblem,
  publishDsaProblem,
  saveDsaProblem,
  unpublishDsaProblem,
} from '../learning-actions';
import { dsaProblemSchema } from '../schemas';
import { slugify } from '../slugify';
import { ConfirmButton } from './confirm-button';
import { Field, INPUT_CLASS } from './field';
import { LearningEditorHeader } from './learning-editor-header';
import { useLearningEditor } from './use-learning-editor';

const EMPTY_EXAMPLE: DsaExample = { input: '', output: '', explanation: '' };

function toInput(problem: AdminDsaProblem | null): DsaProblemInput {
  return {
    slug: problem?.slug ?? '',
    title: problem?.title ?? '',
    topic: problem?.topic ?? 'arrays',
    difficulty: problem?.difficulty ?? 'easy',
    problemStatement: problem?.problemStatement ?? '',
    examples: problem?.examples ?? [{ ...EMPTY_EXAMPLE }],
    constraints: problem?.constraints ?? [],
    bruteForceApproach: problem?.bruteForceApproach ?? '',
    optimizedApproach: problem?.optimizedApproach ?? '',
    explanation: problem?.explanation ?? '',
    timeComplexity: problem?.timeComplexity ?? '',
    spaceComplexity: problem?.spaceComplexity ?? '',
    dryRun: problem?.dryRun ?? '',
    solutions: problem?.solutions ?? { javascript: '', typescript: '', java: '', go: '' },
  };
}

export function DsaEditor({ problem: initial }: { problem: AdminDsaProblem | null }) {
  const editor = useLearningEditor({
    initial,
    initialInput: toInput(initial),
    schema: dsaProblemSchema,
    basePath: '/admin/dsa',
    actions: {
      save: saveDsaProblem,
      publish: publishDsaProblem,
      unpublish: unpublishDsaProblem,
      remove: deleteDsaProblem,
    },
  });
  const { input, errors, update, record } = editor;
  const [language, setLanguage] = useState<SolutionLanguage>('javascript');
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));

  function markdownField(key: keyof DsaProblemInput, label: string, hint?: string, rows = 4) {
    return (
      <Field id={key} label={label} hint={hint} error={errors[key]}>
        <textarea
          id={key}
          rows={rows}
          value={input[key] as string}
          onChange={(event) => update(key, event.target.value as never)}
          aria-invalid={Boolean(errors[key])}
          className={cn(INPUT_CLASS, 'font-mono')}
        />
      </Field>
    );
  }

  function updateExample(index: number, change: Partial<DsaExample>) {
    update(
      'examples',
      input.examples.map((example, position) =>
        position === index ? { ...example, ...change } : example,
      ),
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        editor.save();
      }}
      className="space-y-6"
    >
      <LearningEditorHeader
        title={record ? 'Edit problem' : 'New problem'}
        status={record?.status ?? 'draft'}
        liveHref={record?.status === 'published' ? `/dsa/${record.slug}` : undefined}
        dirty={editor.dirty}
        busy={editor.pending}
        message={editor.message}
        onPublish={editor.publish}
        onUnpublish={editor.unpublish}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="title" label="Title" error={errors.title}>
          <input
            id="title"
            value={input.title}
            onChange={(event) => {
              update('title', event.target.value);
              if (!slugEdited && !record) update('slug', slugify(event.target.value));
            }}
            aria-invalid={Boolean(errors.title)}
            className={INPUT_CLASS}
          />
        </Field>
        <Field id="slug" label="Slug" error={errors.slug} hint={`/dsa/${input.slug || '…'}`}>
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
        <Field id="topic" label="Topic" error={errors.topic}>
          <select
            id="topic"
            value={input.topic}
            onChange={(event) => update('topic', event.target.value as DsaTopic)}
            className={INPUT_CLASS}
          >
            {DSA_TOPICS.map(({ slug, name }) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="difficulty" label="Difficulty" error={errors.difficulty}>
          <select
            id="difficulty"
            value={input.difficulty}
            onChange={(event) => update('difficulty', event.target.value as Difficulty)}
            className={INPUT_CLASS}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </Field>
      </div>

      {markdownField('problemStatement', 'Problem statement', 'Markdown.')}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Examples</legend>
        {input.examples.map((example, index) => (
          <div key={index} className="grid gap-2 rounded-xl border bg-card p-3 md:grid-cols-3">
            <input
              aria-label={`Example ${index + 1} input`}
              placeholder="Input"
              value={example.input}
              onChange={(event) => updateExample(index, { input: event.target.value })}
              className={cn(INPUT_CLASS, 'font-mono')}
            />
            <input
              aria-label={`Example ${index + 1} output`}
              placeholder="Output"
              value={example.output}
              onChange={(event) => updateExample(index, { output: event.target.value })}
              className={cn(INPUT_CLASS, 'font-mono')}
            />
            <div className="flex gap-2">
              <input
                aria-label={`Example ${index + 1} explanation`}
                placeholder="Explanation (optional)"
                value={example.explanation ?? ''}
                onChange={(event) => updateExample(index, { explanation: event.target.value })}
                className={INPUT_CLASS}
              />
              <button
                type="button"
                aria-label={`Remove example ${index + 1}`}
                onClick={() =>
                  update(
                    'examples',
                    input.examples.filter((_, position) => position !== index),
                  )
                }
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <X aria-hidden />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update('examples', [...input.examples, { ...EMPTY_EXAMPLE }])}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Plus aria-hidden />
          Add example
        </button>
      </fieldset>

      <Field id="constraints" label="Constraints" hint="One per line." error={errors.constraints}>
        <textarea
          id="constraints"
          rows={3}
          value={input.constraints.join('\n')}
          onChange={(event) =>
            update('constraints', event.target.value === '' ? [] : event.target.value.split('\n'))
          }
          className={cn(INPUT_CLASS, 'font-mono')}
        />
      </Field>

      {markdownField('bruteForceApproach', 'Brute-force approach', 'Markdown.')}
      {markdownField('optimizedApproach', 'Optimized approach', 'Markdown.')}
      {markdownField('explanation', 'Explanation', 'Markdown. Why the optimized approach works.')}

      <div className="grid gap-4 md:grid-cols-2">
        <Field id="timeComplexity" label="Time complexity" error={errors.timeComplexity}>
          <input
            id="timeComplexity"
            value={input.timeComplexity}
            onChange={(event) => update('timeComplexity', event.target.value)}
            className={cn(INPUT_CLASS, 'font-mono')}
          />
        </Field>
        <Field id="spaceComplexity" label="Space complexity" error={errors.spaceComplexity}>
          <input
            id="spaceComplexity"
            value={input.spaceComplexity}
            onChange={(event) => update('spaceComplexity', event.target.value)}
            className={cn(INPUT_CLASS, 'font-mono')}
          />
        </Field>
      </div>

      {markdownField('dryRun', 'Dry run', 'Markdown. Tables work well.', 6)}

      <section aria-label="Solutions" className="overflow-hidden rounded-xl border bg-card">
        <div
          role="group"
          aria-label="Solution language"
          className="flex flex-wrap gap-1 border-b p-2"
        >
          {SOLUTION_LANGUAGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={language === key}
              onClick={() => setLanguage(key)}
              className={buttonVariants({
                variant: language === key ? 'secondary' : 'ghost',
                size: 'sm',
              })}
            >
              {label}
              {input.solutions[key].trim() ? '' : ' (empty)'}
            </button>
          ))}
        </div>
        <textarea
          aria-label={`${language} solution`}
          spellCheck={false}
          value={input.solutions[language]}
          onChange={(event) =>
            update('solutions', { ...input.solutions, [language]: event.target.value })
          }
          className="block min-h-72 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
        />
      </section>
      <p className="text-xs text-muted-foreground">
        Publishing needs a statement, an example, the optimized approach, both complexities and all
        four languages.
      </p>

      {record && (
        <ConfirmButton
          label="Delete problem"
          title="Delete this problem?"
          description={`“${record.title}” will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete permanently"
          disabled={editor.pending}
          onConfirm={editor.remove}
        />
      )}
    </form>
  );
}
