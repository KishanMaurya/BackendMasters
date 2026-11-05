import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AdminArticle,
  AdminArticleListItem,
  ArticleInput,
  ArticleUpdateInput,
  ContentChange,
} from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import { Paginated } from '../../common/http/paginated.js';
import type { Env } from '../../config/env.js';
import { AdminArticlesRepository } from './admin-articles.repository.js';
import type { ListAdminArticlesQuery } from './dto/article-input.dto.js';
import { IMAGE_BUCKET } from './media.service.js';
import { RevalidationService } from './revalidation.service.js';

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** An unchanged earlier date is kept, so republishing doesn't make an old article look new. */
export function resolvePublishDate(
  requested: string | undefined,
  existing: string | null,
  now = new Date(),
): string {
  if (requested) return new Date(requested).toISOString();
  if (existing && new Date(existing) <= now) return existing;
  return now.toISOString();
}

@Injectable()
export class AdminArticlesService {
  private readonly imagePrefix: string;

  constructor(
    private readonly articles: AdminArticlesRepository,
    private readonly revalidation: RevalidationService,
    config: ConfigService<Env, true>,
  ) {
    const url = config.get('SUPABASE_URL', { infer: true }) ?? '';
    this.imagePrefix = `${url}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  }

  async list(
    admin: AdminContext,
    query: ListAdminArticlesQuery,
  ): Promise<Paginated<AdminArticleListItem>> {
    const { items, total } = await this.articles.list(admin, query);
    return new Paginated(items, { page: query.page, pageSize: query.pageSize, total });
  }

  async get(admin: AdminContext, id: string): Promise<AdminArticle> {
    const article = await this.articles.findById(admin, id);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(admin: AdminContext, input: ArticleInput): Promise<AdminArticle> {
    const id = await this.articles.save(admin, this.toCommand(input, null, null));
    return this.get(admin, id);
  }

  async update(
    admin: AdminContext,
    id: string,
    { expectedUpdatedAt, ...input }: ArticleUpdateInput,
  ): Promise<ContentChange<AdminArticle>> {
    await this.articles.save(admin, this.toCommand(input, id, expectedUpdatedAt));
    const result = await this.get(admin, id);
    // Drafts aren't visible to anyone, so there is nothing on the site to refresh.
    if (result.state === 'draft') return { result, revalidated: true };
    return { result, revalidated: await this.revalidation.revalidateContent() };
  }

  async publish(
    admin: AdminContext,
    id: string,
    requestedDate?: string,
  ): Promise<ContentChange<AdminArticle>> {
    const article = await this.get(admin, id);
    if (!article.description.trim() || !article.content.trim()) {
      throw new UnprocessableEntityException(
        'Add a description and some content before publishing',
      );
    }

    const publishedAt = resolvePublishDate(requestedDate, article.publishedAt);
    await this.articles.setStatus(admin, id, { status: 'published', publishedAt });
    return this.changed(admin, id);
  }

  async unpublish(admin: AdminContext, id: string): Promise<ContentChange<AdminArticle>> {
    const found = await this.articles.setStatus(admin, id, { status: 'draft' });
    if (!found) throw new NotFoundException('Article not found');
    return this.changed(admin, id);
  }

  async delete(admin: AdminContext, id: string): Promise<{ revalidated: boolean }> {
    const found = await this.articles.delete(admin, id);
    if (!found) throw new NotFoundException('Article not found');
    return { revalidated: await this.revalidation.revalidateContent() };
  }

  private async changed(admin: AdminContext, id: string): Promise<ContentChange<AdminArticle>> {
    const result = await this.get(admin, id);
    return { result, revalidated: await this.revalidation.revalidateContent() };
  }

  private toCommand(input: ArticleInput, id: string | null, expectedUpdatedAt: string | null) {
    // Images are served through next/image, which only accepts our own storage.
    if (input.coverImageUrl && !input.coverImageUrl.startsWith(this.imagePrefix)) {
      throw new BadRequestException('The cover image must be uploaded here');
    }
    return {
      ...input,
      id,
      expectedUpdatedAt,
      seoTitle: input.seoTitle?.trim() || null,
      seoDescription: input.seoDescription?.trim() || null,
      readingTimeMinutes: estimateReadingTime(input.content),
    };
  }
}
