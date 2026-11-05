'use client';

import { useState } from 'react';
import type {
  AdminInterviewQuestion,
  Difficulty,
  InterviewQuestionInput,
} from '@backendmasters/shared';
import { cn } from '@/lib/utils';
import {
  deleteInterviewQuestion,
  publishInterviewQuestion,
  saveInterviewQuestion,
  unpublishInterviewQuestion,
} from '../learning-actions';
import { interviewQuestionSchema } from '../schemas';
import { slugify } from '../slugify';
import { ConfirmButton } from './confirm-button';
import { Field, INPUT_CLASS } from './field';
import { LearningEditorHeader } from './learning-editor-header';
import { useLearningEditor } from './use-learning-editor';

const CODE_LANGUAGES = ['javascript', 'typescript', 'go', 'java', 'python', 'sql', 'bash', 'json'];

function toInput(question: AdminInterviewQuestion | null): InterviewQuestionInput {
  return {
    slug: question?.slug ?? '',
    title: question?.title ?? '',
    technology: question?.technology ?? '',
    topic: question?.topic ?? '',
    interviewCategory: question?.interviewCategory ?? '',
    difficulty: question?.difficulty ?? 'easy',
    shortAnswer: question?.shortAnswer ?? '',
    detailedExplanation: question?.detailedExplanation ?? '',
    practicalExample: question?.practicalExample ?? '',
    codeExample: question?.codeExample ?? '',
    codeLanguage: question?.codeLanguage ?? '',
    relatedQuestionIds: question?.relatedQuestionIds ?? [],
  };
}

export function QuestionEditor({
  question: initial,
  others,
}: {
  question: AdminInterviewQuestion | null;
  others: AdminInterviewQuestion[];
}) {
  const editor = useLearningEditor({
    initial,
    initialInput: toInput(initial),
    schema: interviewQuestionSchema,
    basePath: '/admin/interview',
    actions: {
      save: saveInterviewQuestion,
      publish: publishInterviewQuestion,
      unpublish: unpublishInterviewQuestion,
      remove: deleteInterviewQuestion,
    },
  });
  const { input, errors, update, record } = editor;
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const candidates = others.filter((question) => question.id !== record?.id);

  function textField(
    key: 'technology' | 'topic' | 'interviewCategory',
    label: string,
    hint: string,
  ) {
    return (
      <Field id={key} label={label} hint={hint} error={errors[key]}>
        <input
          id={key}
          value={input[key] ?? ''}
          onChange={(event) => update(key, event.target.value)}
          aria-invalid={Boolean(errors[key])}
          className={INPUT_CLASS}
        />
      </Field>
    );
  }

  function markdownField(
    key: 'shortAnswer' | 'detailedExplanation' | 'practicalExample',
    label: string,
    hint: string,
    rows: number,
  ) {
    return (
      <Field id={key} label={label} hint={hint} error={errors[key]}>
        <textarea
          id={key}
          rows={rows}
          value={input[key]}
          onChange={(event) => update(key, event.target.value)}
          aria-invalid={Boolean(errors[key])}
          className={cn(INPUT_CLASS, 'font-mono')}
        />
      </Field>
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
        title={record ? 'Edit question' : 'New question'}
        status={record?.status ?? 'draft'}
        liveHref={
          record?.status === 'published' ? `/interview-questions/${record.slug}` : undefined
        }
        dirty={editor.dirty}
        busy={editor.pending}
        message={editor.message}
        onPublish={editor.publish}
        onUnpublish={editor.unpublish}
      />

      <Field id="title" label="Question" error={errors.title}>
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
      <Field
        id="slug"
        label="Slug"
        error={errors.slug}
        hint={`/interview-questions/${input.slug || '…'}`}
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

      <div className="grid gap-4 md:grid-cols-2">
        {textField('technology', 'Technology', 'Appears as a filter, for example Node.js.')}
        {textField('topic', 'Topic', 'Appears as a filter, for example Concurrency.')}
        {textField(
          'interviewCategory',
          'Interview category',
          'Optional, for example Concepts or Scenario.',
        )}
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

      {markdownField('shortAnswer', 'Short answer', 'Markdown. Needed to publish.', 3)}
      {markdownField('detailedExplanation', 'Detailed explanation', 'Markdown.', 6)}
      {markdownField('practicalExample', 'Practical example', 'Markdown.', 4)}

      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <Field id="codeLanguage" label="Code language">
          <select
            id="codeLanguage"
            value={input.codeLanguage ?? ''}
            onChange={(event) => update('codeLanguage', event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">None</option>
            {CODE_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </Field>
        <Field id="codeExample" label="Code example" hint="Optional.">
          <textarea
            id="codeExample"
            rows={6}
            spellCheck={false}
            value={input.codeExample ?? ''}
            onChange={(event) => update('codeExample', event.target.value)}
            className={cn(INPUT_CLASS, 'font-mono')}
          />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Related questions</legend>
        {candidates.length === 0 ? (
          <p className="text-xs text-muted-foreground">No other questions yet.</p>
        ) : (
          <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto rounded-xl border bg-card p-3">
            {candidates.map((candidate) => (
              <label key={candidate.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={input.relatedQuestionIds.includes(candidate.id)}
                  onChange={(event) =>
                    update(
                      'relatedQuestionIds',
                      event.target.checked
                        ? [...input.relatedQuestionIds, candidate.id]
                        : input.relatedQuestionIds.filter((id) => id !== candidate.id),
                    )
                  }
                  className="size-4 accent-primary"
                />
                {candidate.title}
              </label>
            ))}
          </div>
        )}
        {errors.relatedQuestionIds && (
          <p className="text-xs text-destructive">{errors.relatedQuestionIds}</p>
        )}
      </fieldset>

      {record && (
        <ConfirmButton
          label="Delete question"
          title="Delete this question?"
          description={`“${record.title}” will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete permanently"
          disabled={editor.pending}
          onConfirm={editor.remove}
        />
      )}
    </form>
  );
}
