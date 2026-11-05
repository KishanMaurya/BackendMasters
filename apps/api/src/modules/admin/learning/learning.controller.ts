import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  AdminDsaProblem,
  AdminInterviewQuestion,
  ContentChange,
} from '@backendmasters/shared';
import { AdminGuard, type AdminContext } from '../../../common/auth/admin.guard.js';
import { CurrentAdmin } from '../../../common/auth/current-admin.decorator.js';
import { ArticleIdParam } from '../dto/article-input.dto.js';
import {
  DsaProblemInputDto,
  DsaProblemUpdateDto,
  InterviewQuestionInputDto,
  InterviewQuestionUpdateDto,
} from './learning-input.dto.js';
import { LearningService } from './learning.service.js';

@ApiTags('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Signed in, but not an administrator' })
@UseGuards(AdminGuard)
@Controller('admin')
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('dsa-problems')
  @ApiOperation({ summary: 'List all DSA problems, including drafts' })
  listDsa(@CurrentAdmin() admin: AdminContext): Promise<AdminDsaProblem[]> {
    return this.learning.listDsa(admin);
  }

  @Get('dsa-problems/:id')
  @ApiOperation({ summary: 'Read any DSA problem' })
  getDsa(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<AdminDsaProblem> {
    return this.learning.getDsa(admin, id);
  }

  @Post('dsa-problems')
  @ApiOperation({ summary: 'Create a draft DSA problem' })
  createDsa(
    @CurrentAdmin() admin: AdminContext,
    @Body() input: DsaProblemInputDto,
  ): Promise<AdminDsaProblem> {
    return this.learning.createDsa(admin, input);
  }

  @Put('dsa-problems/:id')
  @ApiOperation({ summary: 'Save a DSA problem' })
  updateDsa(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
    @Body() input: DsaProblemUpdateDto,
  ): Promise<ContentChange<AdminDsaProblem>> {
    return this.learning.updateDsa(admin, id, input);
  }

  @Post('dsa-problems/:id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a DSA problem. Needs every section and all four languages.' })
  publishDsa(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<ContentChange<AdminDsaProblem>> {
    return this.learning.publishDsa(admin, id);
  }

  @Post('dsa-problems/:id/unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Return a DSA problem to draft' })
  unpublishDsa(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<ContentChange<AdminDsaProblem>> {
    return this.learning.unpublishDsa(admin, id);
  }

  @Delete('dsa-problems/:id')
  @ApiOperation({ summary: 'Delete a DSA problem permanently' })
  deleteDsa(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<{ revalidated: boolean }> {
    return this.learning.deleteDsa(admin, id);
  }

  @Get('interview-questions')
  @ApiOperation({ summary: 'List all interview questions, including drafts' })
  listQuestions(@CurrentAdmin() admin: AdminContext): Promise<AdminInterviewQuestion[]> {
    return this.learning.listQuestions(admin);
  }

  @Get('interview-questions/:id')
  @ApiOperation({ summary: 'Read any interview question' })
  getQuestion(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<AdminInterviewQuestion> {
    return this.learning.getQuestion(admin, id);
  }

  @Post('interview-questions')
  @ApiOperation({ summary: 'Create a draft interview question' })
  createQuestion(
    @CurrentAdmin() admin: AdminContext,
    @Body() input: InterviewQuestionInputDto,
  ): Promise<AdminInterviewQuestion> {
    return this.learning.createQuestion(admin, input);
  }

  @Put('interview-questions/:id')
  @ApiOperation({ summary: 'Save an interview question' })
  updateQuestion(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
    @Body() input: InterviewQuestionUpdateDto,
  ): Promise<ContentChange<AdminInterviewQuestion>> {
    return this.learning.updateQuestion(admin, id, input);
  }

  @Post('interview-questions/:id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish an interview question' })
  publishQuestion(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<ContentChange<AdminInterviewQuestion>> {
    return this.learning.publishQuestion(admin, id);
  }

  @Post('interview-questions/:id/unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Return an interview question to draft' })
  unpublishQuestion(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<ContentChange<AdminInterviewQuestion>> {
    return this.learning.unpublishQuestion(admin, id);
  }

  @Delete('interview-questions/:id')
  @ApiOperation({ summary: 'Delete an interview question permanently' })
  deleteQuestion(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<{ revalidated: boolean }> {
    return this.learning.deleteQuestion(admin, id);
  }
}
