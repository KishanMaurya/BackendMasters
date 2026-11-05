import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SearchResult, SearchSuggestion, SitemapEntry } from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import { Paginated } from '../../common/http/paginated.js';
import {
  SearchQuery,
  SearchResultDto,
  SearchSuggestionDto,
  SitemapEntryDto,
  SuggestionsQuery,
} from './dto/search.dto.js';
import { SearchRepository } from './search.repository.js';

@ApiTags('search')
@Controller()
export class SearchController {
  constructor(private readonly searcher: SearchRepository) {}

  @Get('search')
  @ApiOperation({ summary: 'Search published articles, DSA problems and interview questions' })
  @ApiOkEnvelope(SearchResultDto, { isArray: true, paginated: true })
  async search(@Query() query: SearchQuery): Promise<Paginated<SearchResult>> {
    const { items, total } = await this.searcher.search(query);
    return new Paginated(items, { page: query.page, pageSize: query.pageSize, total });
  }

  @Get('search/suggestions')
  @ApiOperation({ summary: 'Published titles matching what has been typed so far' })
  @ApiOkEnvelope(SearchSuggestionDto, { isArray: true })
  suggestions(@Query() { q }: SuggestionsQuery): Promise<SearchSuggestion[]> {
    return this.searcher.suggest(q);
  }

  @Get('sitemap-entries')
  @ApiOperation({ summary: 'Everything published, for the XML sitemap' })
  @ApiOkEnvelope(SitemapEntryDto, { isArray: true })
  sitemap(): Promise<SitemapEntry[]> {
    return this.searcher.findSitemapEntries();
  }
}
