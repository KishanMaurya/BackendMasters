'use client';

import { useActionState, useState } from 'react';
import { buttonVariants } from '@/components/ui/button-variants';
import { signIn } from '../actions';
import { Field, INPUT_CLASS, Notice } from './field';

export function SignInForm() {
  const [error, action, pending] = useActionState(signIn, null);
  // React clears a form after its action runs, and retyping the email after a typo is annoying.
  const [email, setEmail] = useState('');

  return (
    <form action={action} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Field id="email" label="Email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={INPUT_CLASS}
        />
      </Field>
      <Field id="password" label="Password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={INPUT_CLASS}
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ size: 'lg', className: 'w-full' })}
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
