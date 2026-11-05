import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ArticleDetail, ArticleSummary } from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import type { Paginated } from '../../common/http/paginated.js';
import { ArticlesService } from './articles.service.js';
import { ArticleDetailDto, ArticleSummaryDto } from './dto/article.dto.js';
import { ListArticlesQuery } from './dto/list-articles.query.js';
import { SlugParam } from './dto/slug.param.js';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List published articles, newest first' })
  @ApiOkEnvelope(ArticleSummaryDto, { isArray: true, paginated: true })
  list(@Query() query: ListArticlesQuery): Promise<Paginated<ArticleSummary>> {
    return this.articles.list(query);
  }

  // Declared before :slug, so "slugs" is a reserved word for article slugs.
  @Get('slugs')
  @ApiOperation({ summary: 'List every published slug, for prerendering' })
  @ApiOkResponse({ description: '`data` is an array of slugs', schema: { type: 'object' } })
  listSlugs(): Promise<string[]> {
    return this.articles.listSlugs();
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Up to three related published articles' })
  @ApiOkEnvelope(ArticleSummaryDto, { isArray: true })
  @ApiNotFoundResponse({ description: 'No published article has this slug' })
  related(@Param() { slug }: SlugParam): Promise<ArticleSummary[]> {
    return this.articles.getRelated(slug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Read one published article' })
  @ApiOkEnvelope(ArticleDetailDto)
  @ApiNotFoundResponse({ description: 'No published article has this slug' })
  get(@Param() { slug }: SlugParam): Promise<ArticleDetail> {
    return this.articles.getBySlug(slug);
  }
}
