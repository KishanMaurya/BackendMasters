import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Get(':slug')
  @ApiOperation({ summary: 'Read one published article' })
  @ApiOkEnvelope(ArticleDetailDto)
  @ApiNotFoundResponse({ description: 'No published article has this slug' })
  get(@Param() { slug }: SlugParam): Promise<ArticleDetail> {
    return this.articles.getBySlug(slug);
  }
}
