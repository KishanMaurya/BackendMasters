import { Injectable, NotFoundException } from '@nestjs/common';
import type { ArticleDetail, ArticleSummary } from '@backendmasters/shared';
import { Paginated } from '../../common/http/paginated.js';
import { ArticlesRepository } from './articles.repository.js';
import type { ListArticlesQuery } from './dto/list-articles.query.js';

@Injectable()
export class ArticlesService {
  constructor(private readonly articles: ArticlesRepository) {}

  async list(query: ListArticlesQuery): Promise<Paginated<ArticleSummary>> {
    const { items, total } = await this.articles.findPublished(query);
    return new Paginated(items, { page: query.page, pageSize: query.pageSize, total });
  }

  async getBySlug(slug: string): Promise<ArticleDetail> {
    const article = await this.articles.findBySlug(slug);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }
}
