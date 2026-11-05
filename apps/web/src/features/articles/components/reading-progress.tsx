'use client';

import { useEffect, useRef } from 'react';

/** A thin bar under the header showing progress through the element with this id. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const target = document.getElementById(targetId);
      const bar = barRef.current;
      if (!target || !bar) return;
      const { top, height } = target.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -top / scrollable)) : 1;
      bar.style.transform = `scaleX(${progress})`;
    }

    function schedule() {
      frame ||= requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [targetId]);

  return (
    <div aria-hidden className="fixed inset-x-0 top-16 z-30 h-0.5">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-primary" />
    </div>
  );
}
