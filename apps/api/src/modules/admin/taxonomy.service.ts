import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminCategory,
  AdminTag,
  CategoryInput,
  ContentChange,
  TagInput,
} from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import { RevalidationService } from './revalidation.service.js';
import { TaxonomyRepository } from './taxonomy.repository.js';

/**
 * Categories can be edited but not created or deleted: each one has its own route,
 * illustration and catalog entry in the web app, so a new one needs code as well.
 */
@Injectable()
export class TaxonomyService {
  constructor(
    private readonly taxonomy: TaxonomyRepository,
    private readonly revalidation: RevalidationService,
  ) {}

  listCategories(admin: AdminContext): Promise<AdminCategory[]> {
    return this.taxonomy.listCategories(admin);
  }

  async updateCategory(
    admin: AdminContext,
    id: string,
    input: CategoryInput,
  ): Promise<ContentChange<AdminCategory>> {
    const found = await this.taxonomy.updateCategory(admin, id, input);
    if (!found) throw new NotFoundException('Category not found');
    const categories = await this.taxonomy.listCategories(admin);
    const result = categories.find((category) => category.id === id);
    if (!result) throw new NotFoundException('Category not found');
    return { result, revalidated: await this.revalidation.revalidateContent() };
  }

  listTags(admin: AdminContext): Promise<AdminTag[]> {
    return this.taxonomy.listTags(admin);
  }

  /** A new tag isn't on any article yet, so the site has nothing to refresh. */
  createTag(admin: AdminContext, input: TagInput): Promise<AdminTag> {
    return this.taxonomy.createTag(admin, input);
  }

  async updateTag(
    admin: AdminContext,
    id: string,
    input: TagInput,
  ): Promise<ContentChange<AdminTag>> {
    const result = await this.taxonomy.updateTag(admin, id, input);
    if (!result) throw new NotFoundException('Tag not found');
    return { result, revalidated: await this.revalidation.revalidateContent() };
  }

  async deleteTag(admin: AdminContext, id: string): Promise<{ revalidated: boolean }> {
    const found = await this.taxonomy.deleteTag(admin, id);
    if (!found) throw new NotFoundException('Tag not found');
    return { revalidated: await this.revalidation.revalidateContent() };
  }
}
