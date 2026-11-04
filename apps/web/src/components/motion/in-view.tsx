'use client';

import { useEffect, useRef, type ComponentProps } from 'react';

/** Marks whether its content is on screen. motion.css pauses animation while it isn't. */
export function InView(props: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.inview = String(entry?.isIntersecting ?? true);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} {...props} />;
}
