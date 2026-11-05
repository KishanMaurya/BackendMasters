import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow } from '@/components/catalog/section-heading';
import { ArticleGrid } from '@/features/articles/components/article-grid';
import { formatDate } from '@/features/articles/components/article-card';
import { ReadingProgress } from '@/features/articles/components/reading-progress';
import { TableOfContents } from '@/features/articles/components/table-of-contents';
import { listingHref } from '@/features/articles/listing-params';
import { getArticle, getArticleSlugs, getRelatedArticles } from '@/features/articles/queries';
import { renderArticle } from '@/features/articles/rendered-article';
import { getCategory } from '@/features/catalog/categories';
import { JsonLd } from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';
import { articleData, breadcrumbData } from '@/features/seo/structured-data';
import { env } from '@/lib/env';

/**
 * Blocking, not streamed: the first request for an article published after the build waits for
 * the full render. That gives crawlers complete HTML and a real 404 status for missing articles,
 * which streaming can't, because its 200 status is sent before the article is looked up.
 * Articles known at build time are still served instantly.
 */
export const instant = false;

/** Cache Components needs at least one param to validate the route at build time. */
const BUILD_PLACEHOLDER = '__placeholder__';
const ARTICLE_BODY_ID = 'article-body';

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: BUILD_PLACEHOLDER }];
}

export async function generateMetadata({
  params,
}: PageProps<'/articles/[slug]'>): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};

  return pageMetadata({
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.description,
    path: `/articles/${article.slug}`,
    article: { publishedTime: article.publishedAt, modifiedTime: article.updatedAt },
    image: article.coverImageUrl,
  });
}

export default async function ArticlePage({ params }: PageProps<'/articles/[slug]'>) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [{ content, headings }, related] = await Promise.all([
    renderArticle(article.content),
    getRelatedArticles(slug),
  ]);
  const category = getCategory(article.categorySlug);
  const showToc = headings.length >= 2;

  return (
    <>
      <JsonLd
        data={articleData(env.NEXT_PUBLIC_SITE_URL, {
          title: article.title,
          description: article.seoDescription ?? article.description,
          path: `/articles/${article.slug}`,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          authorName: article.author?.displayName,
          imageUrl: article.coverImageUrl,
        })}
      />
      <JsonLd
        data={breadcrumbData(env.NEXT_PUBLIC_SITE_URL, [
          { name: 'Home', path: '/' },
          { name: category.name, path: category.href },
          { name: article.title, path: `/articles/${article.slug}` },
        ])}
      />
      <ReadingProgress targetId={ARTICLE_BODY_ID} />

      <header className="border-b">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={category.href} className="hover:text-foreground">
                  {category.name}
                </Link>
              </li>
            </ol>
          </nav>
          <div className="max-w-3xl space-y-4">
            <Eyebrow>{article.categoryName}</Eyebrow>
            <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
              {article.title}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{article.description}</p>
          </div>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
            {article.author && (
              // Its own line on phones. Otherwise this row can wrap differently once the web font
              // loads, moving everything below it.
              <div className="flex basis-full gap-1.5 sm:basis-auto">
                <dt className="sr-only">Author</dt>
                <dd>{article.author.displayName}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="sr-only">Published</dt>
              <dd>
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="sr-only">Reading time</dt>
              <dd>{article.readingTimeMinutes} min read</dd>
            </div>
            {article.difficulty && (
              <div className="flex gap-1.5">
                <dt className="sr-only">Difficulty</dt>
                <dd className="capitalize">{article.difficulty}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,46rem)_15rem] lg:justify-between lg:gap-12 lg:py-14">
        {showToc && (
          <aside className="lg:sticky lg:top-0 lg:order-2">
            <TableOfContents headings={headings} />
          </aside>
        )}
        <div className="min-w-0 lg:order-1">
          {article.coverImageUrl && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-xl border">
              <Image
                src={article.coverImageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 46rem, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <article id={ARTICLE_BODY_ID} className="bm-article">
            {content}
          </article>
          {article.tags.length > 0 && (
            <ul aria-label="Tags" className="mt-10 flex flex-wrap gap-2 border-t pt-6">
              {article.tags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    href={listingHref({ tag: tag.slug })}
                    className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors duration-(--motion-fast) hover:border-foreground/30 hover:text-foreground"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="border-t bg-card/50 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 id="related" className="mb-6 text-2xl font-semibold tracking-tight">
              Keep reading
            </h2>
            <ArticleGrid articles={related} />
          </div>
        </section>
      )}
    </>
  );
}
