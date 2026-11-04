import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BRAND } from '@backendmasters/shared';
import { Eyebrow } from '@/components/catalog/section-heading';
import { InView } from '@/components/motion/in-view';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { HeroScene, HeroSceneCompact } from './hero-scene';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* One soft glow behind the scene, the page's whole gradient budget. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 size-[34rem] -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="bm-hero-mask pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bm-hero-grid absolute -inset-12" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 lg:py-24">
        <div className="space-y-6">
          <Eyebrow className="bm-enter">{BRAND.tagline}</Eyebrow>
          <h1 className="bm-enter-heading text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Master Backend Engineering.
          </h1>
          <p
            style={order(1)}
            className="bm-enter max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Learn how to build, design, and scale real-world systems. Explore DSA, system design,
            cloud architecture, observability, and engineering interview preparation.
          </p>
          <div style={order(2)} className="bm-enter flex flex-wrap gap-3 pt-2">
            <Link
              href="/learn"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group/cta h-11 gap-2 px-5 text-[0.9375rem] hover:bg-primary/90',
              )}
            >
              Explore Learning Paths
              <ArrowRight className="size-4 transition-transform duration-(--motion-base) ease-(--ease-out) group-hover/cta:translate-x-0.5" />
            </Link>
            <Link
              href="/system-design"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-11 px-5 text-[0.9375rem]',
              )}
            >
              Explore System Design
            </Link>
          </div>
        </div>

        <InView style={order(3)} className="bm-enter">
          <div className="hidden lg:block">
            <HeroScene />
          </div>
          <div className="mx-auto max-w-md lg:hidden">
            <HeroSceneCompact />
          </div>
        </InView>
      </div>
    </section>
  );
}
