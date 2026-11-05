import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
  SOLUTION_LANGUAGES,
  type AdminDsaProblem,
  type AdminInterviewQuestion,
  type ContentChange,
  type DsaProblemInput,
  type InterviewQuestionInput,
} from '@backendmasters/shared';
import type { AdminContext } from '../../../common/auth/admin.guard.js';
import { resolvePublishDate } from '../admin-articles.service.js';
import { RevalidationService } from '../revalidation.service.js';
import { LearningRepository } from './learning.repository.js';

/** What a published problem must have, so the page never shows an empty section. */
export function missingForPublish(problem: DsaProblemInput): string[] {
  const missing: string[] = [];
  if (!problem.problemStatement.trim()) missing.push('problem statement');
  if (problem.examples.length === 0) missing.push('an example');
  if (!problem.optimizedApproach.trim()) missing.push('optimized approach');
  if (!problem.timeComplexity.trim()) missing.push('time complexity');
  if (!problem.spaceComplexity.trim()) missing.push('space complexity');
  for (const { key, label } of SOLUTION_LANGUAGES) {
    if (!problem.solutions[key].trim()) missing.push(`${label} solution`);
  }
  return missing;
}

@Injectable()
export class LearningService {
  constructor(
    private readonly learning: LearningRepository,
    private readonly revalidation: RevalidationService,
  ) {}

  listDsa(admin: AdminContext): Promise<AdminDsaProblem[]> {
    return this.learning.listDsa(admin);
  }

  async getDsa(admin: AdminContext, id: string): Promise<AdminDsaProblem> {
    const problem = await this.learning.findDsa(admin, id);
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }

  createDsa(admin: AdminContext, input: DsaProblemInput): Promise<AdminDsaProblem> {
    return this.learning.createDsa(admin, input);
  }

  async updateDsa(
    admin: AdminContext,
    id: string,
    { expectedUpdatedAt, ...input }: DsaProblemInput & { expectedUpdatedAt: string },
  ): Promise<ContentChange<AdminDsaProblem>> {
    const result = await this.learning.updateDsa(admin, id, input, expectedUpdatedAt);
    return this.changedIfVisible(result);
  }

  async publishDsa(admin: AdminContext, id: string): Promise<ContentChange<AdminDsaProblem>> {
    const problem = await this.getDsa(admin, id);
    const missing = missingForPublish(problem);
    if (missing.length > 0) {
      throw new UnprocessableEntityException(`Add these before publishing: ${missing.join(', ')}`);
    }
    await this.learning.setDsaStatus(admin, id, {
      status: 'published',
      publishedAt: resolvePublishDate(undefined, problem.publishedAt),
    });
    return this.changed(await this.getDsa(admin, id));
  }

  async unpublishDsa(admin: AdminContext, id: string): Promise<ContentChange<AdminDsaProblem>> {
    const found = await this.learning.setDsaStatus(admin, id, { status: 'draft' });
    if (!found) throw new NotFoundException('Problem not found');
    return this.changed(await this.getDsa(admin, id));
  }

  async deleteDsa(admin: AdminContext, id: string): Promise<{ revalidated: boolean }> {
    const found = await this.learning.deleteDsa(admin, id);
    if (!found) throw new NotFoundException('Problem not found');
    return { revalidated: await this.revalidation.revalidateContent() };
  }

  listQuestions(admin: AdminContext): Promise<AdminInterviewQuestion[]> {
    return this.learning.listQuestions(admin);
  }

  async getQuestion(admin: AdminContext, id: string): Promise<AdminInterviewQuestion> {
    const question = await this.learning.findQuestion(admin, id);
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  createQuestion(
    admin: AdminContext,
    input: InterviewQuestionInput,
  ): Promise<AdminInterviewQuestion> {
    return this.learning.createQuestion(admin, input);
  }

  async updateQuestion(
    admin: AdminContext,
    id: string,
    { expectedUpdatedAt, ...input }: InterviewQuestionInput & { expectedUpdatedAt: string },
  ): Promise<ContentChange<AdminInterviewQuestion>> {
    const result = await this.learning.updateQuestion(admin, id, input, expectedUpdatedAt);
    return this.changedIfVisible(result);
  }

  async publishQuestion(
    admin: AdminContext,
    id: string,
  ): Promise<ContentChange<AdminInterviewQuestion>> {
    const question = await this.getQuestion(admin, id);
    if (!question.shortAnswer.trim()) {
      throw new UnprocessableEntityException('Add a short answer before publishing');
    }
    await this.learning.setQuestionStatus(admin, id, {
      status: 'published',
      publishedAt: resolvePublishDate(undefined, question.publishedAt),
    });
    return this.changed(await this.getQuestion(admin, id));
  }

  async unpublishQuestion(
    admin: AdminContext,
    id: string,
  ): Promise<ContentChange<AdminInterviewQuestion>> {
    const found = await this.learning.setQuestionStatus(admin, id, { status: 'draft' });
    if (!found) throw new NotFoundException('Question not found');
    return this.changed(await this.getQuestion(admin, id));
  }

  async deleteQuestion(admin: AdminContext, id: string): Promise<{ revalidated: boolean }> {
    const found = await this.learning.deleteQuestion(admin, id);
    if (!found) throw new NotFoundException('Question not found');
    return { revalidated: await this.revalidation.revalidateContent() };
  }

  private async changed<T>(result: T): Promise<ContentChange<T>> {
    return { result, revalidated: await this.revalidation.revalidateContent() };
  }

  /** Drafts aren't visible to anyone, so there is nothing on the site to refresh. */
  private changedIfVisible<T extends { status: string }>(result: T): Promise<ContentChange<T>> {
    return result.status === 'draft'
      ? Promise.resolve({ result, revalidated: true })
      : this.changed(result);
  }
}
