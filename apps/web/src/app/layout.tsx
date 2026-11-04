import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { BRAND } from '@backendmasters/shared';
import { env } from '@/lib/env';
import { THEME_INIT_SCRIPT } from '@/components/layout/theme';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: `${BRAND.name}: ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description:
    'Learn how to build, design, and scale real-world systems. Explore DSA, system design, cloud architecture, observability, and engineering interview preparation.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // Dark-first. The inline script applies a saved light preference before first paint.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
