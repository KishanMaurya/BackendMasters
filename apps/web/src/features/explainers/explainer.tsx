'use client';

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button-variants';

const STEP_MS = 2200;

/**
 * The shared frame for every explainer: controls, a caption for the current step, and the full
 * list of steps as text. Nothing moves until someone presses play, and with reduced motion on,
 * steps change without animation, so the content never depends on motion.
 */
export function Explainer({
  title,
  captions,
  options,
  children,
}: {
  title: string;
  captions: readonly string[];
  /** Extra controls, such as choosing an algorithm. */
  options?: ReactNode;
  children: (step: number) => ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const last = captions.length - 1;
  // A change of options can shorten the list of steps.
  const current = Math.min(step, last);
  const running = playing && current < last;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setStep(current + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [running, current]);

  // Stops when scrolled away, so nothing runs where no one can see it.
  useEffect(() => {
    const element = figure.current;
    if (!element || !running) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) setPlaying(false);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [running]);

  function togglePlay() {
    if (current >= last) setStep(0);
    setPlaying(!running);
  }

  function goTo(target: number) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(target, last)));
  }

  const iconButton = buttonVariants({ variant: 'outline', size: 'icon' });

  return (
    <figure
      ref={figure}
      className="bm-explainer not-prose m-0 rounded-xl border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className="font-heading text-lg font-medium">{title}</figcaption>
        {options}
      </div>

      <div className="mt-4" role="img" aria-label={`${title}. ${captions[current] ?? ''}`}>
        {children(current)}
      </div>

      <p
        aria-live={running ? 'off' : 'polite'}
        className="mt-3 min-h-[3.75rem] text-sm leading-relaxed sm:min-h-10"
      >
        {captions[current]}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous step"
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
          className={iconButton}
        >
          <ChevronLeft aria-hidden />
        </button>
        <button
          type="button"
          aria-label={running ? 'Pause' : 'Play'}
          onClick={togglePlay}
          className={buttonVariants({ size: 'icon' })}
        >
          {running ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>
        <button
          type="button"
          aria-label="Next step"
          disabled={current === last}
          onClick={() => goTo(current + 1)}
          className={iconButton}
        >
          <ChevronRight aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Start over"
          disabled={current === 0}
          onClick={() => goTo(0)}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <RotateCcw aria-hidden />
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Step {current + 1} of {captions.length}
        </span>
      </div>

      <details className="mt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer">Read all steps</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {captions.map((caption, index) => (
            <li key={index}>{caption}</li>
          ))}
        </ol>
      </details>
    </figure>
  );
}
