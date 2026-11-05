import { Injectable, NotFoundException } from '@nestjs/common';
import type { ArticleDetail, ArticleSummary } from '@backendmasters/shared';
import { Paginated } from '../../common/http/paginated.js';
import { ArticlesRepository } from './articles.repository.js';
import type { ListArticlesQuery } from './dto/list-articles.query.js';

const RELATED_LIMIT = 3;

@Injectable()
export class ArticlesService {
  constructor(private readonly articles: ArticlesRepository) {}

  async list(query: ListArticlesQuery): Promise<Paginated<ArticleSummary>> {
    const { items, total } = await this.articles.findPublished(query);
    return new Paginated(items, { page: query.page, pageSize: query.pageSize, total });
  }

  listSlugs(): Promise<string[]> {
    return this.articles.findAllSlugs();
  }

  /** Same category first, topped up with the newest articles so the section is rarely empty. */
  async getRelated(slug: string, limit = RELATED_LIMIT): Promise<ArticleSummary[]> {
    const article = await this.getBySlug(slug);
    const query = { page: 1, pageSize: limit + 1 };

    const sameCategory = await this.articles.findPublished({
      ...query,
      category: article.categorySlug,
    });
    const related = sameCategory.items.filter((item) => item.slug !== slug).slice(0, limit);
    if (related.length === limit) return related;

    const seen = new Set([slug, ...related.map((item) => item.slug)]);
    const { items: newest } = await this.articles.findPublished({
      ...query,
      pageSize: limit + seen.size,
    });
    return [...related, ...newest.filter((item) => !seen.has(item.slug))].slice(0, limit);
  }

  async getBySlug(slug: string): Promise<ArticleDetail> {
    const article = await this.articles.findBySlug(slug);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }
}
