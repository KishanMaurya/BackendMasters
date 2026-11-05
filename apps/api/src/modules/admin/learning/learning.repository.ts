import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminDsaProblem,
  AdminInterviewQuestion,
  DsaProblemInput,
  InterviewQuestionInput,
} from '@backendmasters/shared';
import type { AdminContext } from '../../../common/auth/admin.guard.js';
import { databaseFailure, writeFailure } from '../../../common/http/database-error.js';
import { SupabaseService } from '../../../supabase/supabase.service.js';
import {
  DSA_COLUMNS,
  QUESTION_COLUMNS,
  toAdminDsa,
  toAdminQuestion,
  toDsaColumns,
  toQuestionColumns,
  type AdminDsaRow,
  type AdminQuestionRow,
} from './learning.mapper.js';

export type StatusChange =
  { status: 'draft' } | { status: 'published'; publishedAt: string | null };

const STALE_SAVE = { code: 'BM409', message: 'stale save' };

const toValues = (change: StatusChange) =>
  change.status === 'published'
    ? { status: change.status, published_at: change.publishedAt }
    : { status: change.status };

/** Every query runs as the signed-in administrator, so RLS applies to all of them. */
@Injectable()
export class LearningRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async listDsa(admin: AdminContext): Promise<AdminDsaProblem[]> {
    const { data, error } = await this.client(admin)
      .from('dsa_problems')
      .select(DSA_COLUMNS)
      .order('updated_at', { ascending: false })
      .limit(500);

    if (error) throw databaseFailure('Listing DSA problems for admin', error);
    return (data as unknown as AdminDsaRow[]).map(toAdminDsa);
  }

  async findDsa(admin: AdminContext, id: string): Promise<AdminDsaProblem | null> {
    const { data, error } = await this.client(admin)
      .from('dsa_problems')
      .select(DSA_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (error) throw databaseFailure('Reading a DSA problem for admin', error);
    return data ? toAdminDsa(data as unknown as AdminDsaRow) : null;
  }

  async createDsa(admin: AdminContext, input: DsaProblemInput): Promise<AdminDsaProblem> {
    const { data, error } = await this.client(admin)
      .from('dsa_problems')
      .insert({ ...toDsaColumns(input), category_id: await this.categoryId(admin, 'dsa') })
      .select(DSA_COLUMNS)
      .single();

    if (error) throw writeFailure('Creating a DSA problem', error);
    return toAdminDsa(data as unknown as AdminDsaRow);
  }

  async updateDsa(
    admin: AdminContext,
    id: string,
    input: DsaProblemInput,
    expectedUpdatedAt: string,
  ): Promise<AdminDsaProblem> {
    const { data, error } = await this.client(admin)
      .from('dsa_problems')
      .update(toDsaColumns(input))
      .eq('id', id)
      .eq('updated_at', expectedUpdatedAt)
      .select(DSA_COLUMNS)
      .maybeSingle();

    if (error) throw writeFailure('Saving a DSA problem', error);
    if (data) return toAdminDsa(data as unknown as AdminDsaRow);
    throw (await this.findDsa(admin, id))
      ? writeFailure('Saving a DSA problem', STALE_SAVE)
      : new NotFoundException('Problem not found');
  }

  /** Returns false when no problem has this id. */
  async setDsaStatus(admin: AdminContext, id: string, change: StatusChange): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('dsa_problems')
      .update(toValues(change))
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Changing a DSA problem status', error);
    return data.length > 0;
  }

  /** Returns false when no problem has this id. */
  async deleteDsa(admin: AdminContext, id: string): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('dsa_problems')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Deleting a DSA problem', error);
    return data.length > 0;
  }

  async listQuestions(admin: AdminContext): Promise<AdminInterviewQuestion[]> {
    const { data, error } = await this.client(admin)
      .from('interview_questions')
      .select(QUESTION_COLUMNS)
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (error) throw databaseFailure('Listing interview questions for admin', error);
    return (data as unknown as AdminQuestionRow[]).map(toAdminQuestion);
  }

  async findQuestion(admin: AdminContext, id: string): Promise<AdminInterviewQuestion | null> {
    const { data, error } = await this.client(admin)
      .from('interview_questions')
      .select(QUESTION_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (error) throw databaseFailure('Reading an interview question for admin', error);
    return data ? toAdminQuestion(data as unknown as AdminQuestionRow) : null;
  }

  async createQuestion(
    admin: AdminContext,
    input: InterviewQuestionInput,
  ): Promise<AdminInterviewQuestion> {
    const { data, error } = await this.client(admin)
      .from('interview_questions')
      .insert({
        ...toQuestionColumns(input),
        category_id: await this.categoryId(admin, 'interview-questions'),
      })
      .select(QUESTION_COLUMNS)
      .single();

    if (error) throw writeFailure('Creating an interview question', error);
    return toAdminQuestion(data as unknown as AdminQuestionRow);
  }

  async updateQuestion(
    admin: AdminContext,
    id: string,
    input: InterviewQuestionInput,
    expectedUpdatedAt: string,
  ): Promise<AdminInterviewQuestion> {
    const { data, error } = await this.client(admin)
      .from('interview_questions')
      .update(toQuestionColumns(input))
      .eq('id', id)
      .eq('updated_at', expectedUpdatedAt)
      .select(QUESTION_COLUMNS)
      .maybeSingle();

    if (error) throw writeFailure('Saving an interview question', error);
    if (data) return toAdminQuestion(data as unknown as AdminQuestionRow);
    throw (await this.findQuestion(admin, id))
      ? writeFailure('Saving an interview question', STALE_SAVE)
      : new NotFoundException('Question not found');
  }

  /** Returns false when no question has this id. */
  async setQuestionStatus(admin: AdminContext, id: string, change: StatusChange): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('interview_questions')
      .update(toValues(change))
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Changing an interview question status', error);
    return data.length > 0;
  }

  /** Returns false when no question has this id. */
  async deleteQuestion(admin: AdminContext, id: string): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('interview_questions')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Deleting an interview question', error);
    return data.length > 0;
  }

  private async categoryId(admin: AdminContext, slug: string): Promise<string> {
    const { data, error } = await this.client(admin)
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error) throw databaseFailure('Finding a category', error);
    return data.id;
  }

  private client(admin: AdminContext) {
    return this.supabase.clientForUser(admin.accessToken);
  }
}
