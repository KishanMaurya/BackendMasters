import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  InterviewFacets,
  InterviewQuestionDetail,
  InterviewQuestionSummary,
} from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import { Paginated } from '../../common/http/paginated.js';
import { SlugParam } from '../articles/dto/slug.param.js';
import {
  InterviewFacetsDto,
  InterviewQuestionDetailDto,
  InterviewQuestionSummaryDto,
  ListInterviewQuestionsQuery,
} from './dto/interview.dto.js';
import { InterviewRepository } from './interview.repository.js';

@ApiTags('interview-questions')
@Controller('interview-questions')
export class InterviewController {
  constructor(private readonly questions: InterviewRepository) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter published questions' })
  @ApiOkEnvelope(InterviewQuestionSummaryDto, { isArray: true, paginated: true })
  async list(
    @Query() query: ListInterviewQuestionsQuery,
  ): Promise<Paginated<InterviewQuestionSummary>> {
    const { items, total } = await this.questions.findPublished(query);
    return new Paginated(items, { page: query.page, pageSize: query.pageSize, total });
  }

  // Declared before :slug, so these are reserved words for question slugs.
  @Get('slugs')
  @ApiOperation({ summary: 'List every published slug, for prerendering' })
  @ApiOkResponse({ description: '`data` is an array of slugs', schema: { type: 'object' } })
  listSlugs(): Promise<string[]> {
    return this.questions.findAllSlugs();
  }

  @Get('facets')
  @ApiOperation({ summary: 'The values available in each filter' })
  @ApiOkEnvelope(InterviewFacetsDto)
  facets(): Promise<InterviewFacets> {
    return this.questions.findFacets();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Read one published question' })
  @ApiOkEnvelope(InterviewQuestionDetailDto)
  @ApiNotFoundResponse({ description: 'No published question has this slug' })
  async get(@Param() { slug }: SlugParam): Promise<InterviewQuestionDetail> {
    const question = await this.questions.findBySlug(slug);
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }
}
