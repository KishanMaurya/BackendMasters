import { BRAND } from '@backendmasters/shared';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbData(siteUrl: string, items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).href,
    })),
  };
}

export interface ArticleData {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  authorName?: string | null;
  imageUrl?: string | null;
}

export function articleData(siteUrl: string, article: ArticleData) {
  const url = new URL(article.path, siteUrl).href;
  const publisher = { '@type': 'Organization', name: BRAND.name, url: siteUrl };
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: url,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: article.authorName ? { '@type': 'Person', name: article.authorName } : publisher,
    publisher,
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
  };
}

export function websiteData(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${new URL('/search', siteUrl).href}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Content comes from the database and ends up inside a script tag, where "</script>" would end
 * the tag early. Escaping "<" prevents that, and JSON parsers read it back unchanged.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
