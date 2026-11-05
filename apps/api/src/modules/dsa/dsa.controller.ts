import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DSA_TOPIC_SLUGS,
  type DsaProblemDetail,
  type DsaProblemSummary,
  type DsaTopicCount,
} from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import { Paginated } from '../../common/http/paginated.js';
import { SlugParam } from '../articles/dto/slug.param.js';
import { DsaRepository } from './dsa.repository.js';
import {
  DsaProblemDetailDto,
  DsaProblemSummaryDto,
  DsaTopicCountDto,
  ListDsaProblemsQuery,
} from './dto/dsa.dto.js';

/** Counts in the order the module presents its topics, leaving out empty ones. */
export function countTopics(topics: readonly string[]): DsaTopicCount[] {
  return DSA_TOPIC_SLUGS.map((topic) => ({
    topic,
    count: topics.filter((candidate) => candidate === topic).length,
  })).filter(({ count }) => count > 0);
}

@ApiTags('dsa-problems')
@Controller('dsa-problems')
export class DsaController {
  constructor(private readonly problems: DsaRepository) {}

  @Get()
  @ApiOperation({ summary: 'List published problems' })
  @ApiOkEnvelope(DsaProblemSummaryDto, { isArray: true, paginated: true })
  async list(@Query() query: ListDsaProblemsQuery): Promise<Paginated<DsaProblemSummary>> {
    const { items, total } = await this.problems.findPublished(query);
    return new Paginated(items, { page: query.page, pageSize: query.pageSize, total });
  }

  // Declared before :slug, so these are reserved words for problem slugs.
  @Get('slugs')
  @ApiOperation({ summary: 'List every published slug, for prerendering' })
  @ApiOkResponse({ description: '`data` is an array of slugs', schema: { type: 'object' } })
  listSlugs(): Promise<string[]> {
    return this.problems.findAllSlugs();
  }

  @Get('topics')
  @ApiOperation({ summary: 'Published problems per topic' })
  @ApiOkEnvelope(DsaTopicCountDto, { isArray: true })
  async topics(): Promise<DsaTopicCount[]> {
    return countTopics(await this.problems.findAllTopics());
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Read one published problem' })
  @ApiOkEnvelope(DsaProblemDetailDto)
  @ApiNotFoundResponse({ description: 'No published problem has this slug' })
  async get(@Param() { slug }: SlugParam): Promise<DsaProblemDetail> {
    const problem = await this.problems.findBySlug(slug);
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }
}
