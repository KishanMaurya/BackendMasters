'use client';

import { Check, Copy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'copied' | 'failed';

const LABEL: Record<Status, string> = { idle: 'Copy', copied: 'Copied', failed: 'Failed' };

export function CopyButton({ text, subject = 'code' }: { text: string; subject?: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    let next: Status = 'copied';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be denied, or missing outside secure contexts.
      next = 'failed';
    }
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  }

  const Icon = status === 'copied' ? Check : status === 'failed' ? X : Copy;

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copy ${subject}`}
      data-status={status}
      className="bm-copy"
    >
      <Icon key={status} aria-hidden className="bm-copy-icon size-3.5" />
      <span aria-live="polite">{LABEL[status]}</span>
    </button>
  );
}
