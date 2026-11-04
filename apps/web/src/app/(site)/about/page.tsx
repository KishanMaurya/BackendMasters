import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import { BRAND } from '@backendmasters/shared';
import { PageHeader } from '@/components/catalog/page-header';
import { Eyebrow } from '@/components/catalog/section-heading';
import { DatabaseIllustration } from '@/components/illustrations';
import { SOCIAL_LINKS } from '@/config/site';

export const metadata: Metadata = {
  title: 'About',
  description: `${BRAND.name} is a learning platform for engineers who want to understand how real systems are built, designed and scaled.`,
};

const PRINCIPLES = [
  {
    title: 'Mechanism over memorisation',
    body: 'Knowing what a load balancer is matters less than knowing what happens when one of its servers slows down. Every article explains how the thing actually works.',
  },
  {
    title: 'Trade-offs, not answers',
    body: 'Real engineering rarely has one correct choice. Each design shows what it costs, where it breaks, and when something simpler would do.',
  },
  {
    title: 'Diagrams that explain',
    body: 'Motion and illustration appear when they make an idea clearer. If an animation doesn’t teach something, it doesn’t belong on the page.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'About' }]}
        title={`About ${BRAND.name}`}
        lede="A learning platform for software engineers, backend developers and candidates preparing for technical interviews. Learn. Build. Design. Scale."
        illustration={
          <DatabaseIllustration live title="A primary database replicating to two replicas" />
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <section key={principle.title} className="bm-reveal rounded-xl border bg-card p-6">
              <h2 className="text-lg font-medium tracking-tight">{principle.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
            </section>
          ))}
        </div>

        <section id="contact" aria-labelledby="contact-heading" className="mt-14 max-w-2xl">
          <Eyebrow>Contact</Eyebrow>
          <h2
            id="contact-heading"
            className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Say hello
          </h2>
          <p className="mt-3 text-muted-foreground">
            Questions, corrections and topic requests are all welcome. Message {BRAND.name} on:
          </p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2.5 text-sm transition-colors duration-(--motion-fast) hover:border-primary/60"
                >
                  {social.label}
                  <ArrowUpRight aria-hidden className="size-4 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
