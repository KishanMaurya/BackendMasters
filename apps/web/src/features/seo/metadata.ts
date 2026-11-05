import type { Metadata } from 'next';
import { BRAND } from '@backendmasters/shared';

const DEFAULT_IMAGE = '/opengraph-image';

export interface PageSeo {
  title: string;
  description: string;
  /** Without query parameters, so filtered views point search engines at the main page. */
  path: string;
  noindex?: boolean;
  /** Only for article-like pages. */
  article?: { publishedTime: string; modifiedTime: string };
  image?: string | null;
}

/** Page titles get the site name from the root layout's template. Social titles need it here. */
export function pageMetadata({
  title,
  description,
  path,
  noindex,
  article,
  image,
}: PageSeo): Metadata {
  const socialTitle = `${title} | ${BRAND.name}`;
  // Setting openGraph here replaces the default image rather than adding to it.
  const images = [image ?? DEFAULT_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: BRAND.name,
      locale: 'en_IN',
      type: article ? 'article' : 'website',
      ...(article ?? {}),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images,
    },
  };
}
