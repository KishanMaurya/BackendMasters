import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  MAX_IMAGE_BYTES,
  type AdminArticle,
  type AdminArticleListItem,
  type AdminCategory,
  type AdminIdentity,
  type AdminTag,
  type ContentChange,
  type DashboardStats,
  type UploadedImage,
} from '@backendmasters/shared';
import { AdminGuard, type AdminContext } from '../../common/auth/admin.guard.js';
import { CurrentAdmin } from '../../common/auth/current-admin.decorator.js';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import type { Paginated } from '../../common/http/paginated.js';
import { AdminArticlesService } from './admin-articles.service.js';
import { DashboardRepository } from './dashboard.repository.js';
import {
  AdminArticleDto,
  AdminArticleListItemDto,
  AdminCategoryDto,
  AdminIdentityDto,
  AdminTagDto,
  ArticleChangeDto,
  DashboardStatsDto,
  UploadedImageDto,
} from './dto/admin-responses.dto.js';
import {
  ArticleIdParam,
  ArticleInputDto,
  ArticleUpdateDto,
  ListAdminArticlesQuery,
  PublishArticleDto,
} from './dto/article-input.dto.js';
import { CategoryInputDto, TagInputDto } from './dto/taxonomy-input.dto.js';
import { MediaService } from './media.service.js';
import { TaxonomyService } from './taxonomy.service.js';

@ApiTags('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Signed in, but not an administrator' })
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly articles: AdminArticlesService,
    private readonly taxonomy: TaxonomyService,
    private readonly media: MediaService,
    private readonly dashboard: DashboardRepository,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'The signed-in administrator' })
  @ApiOkEnvelope(AdminIdentityDto)
  me(@CurrentAdmin() admin: AdminContext): Promise<AdminIdentity> {
    return this.dashboard.findIdentity(admin);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard statistics' })
  @ApiOkEnvelope(DashboardStatsDto)
  stats(@CurrentAdmin() admin: AdminContext): Promise<DashboardStats> {
    return this.dashboard.getStats(admin);
  }

  @Get('articles')
  @ApiOperation({ summary: 'List all articles, including drafts' })
  @ApiOkEnvelope(AdminArticleListItemDto, { isArray: true, paginated: true })
  listArticles(
    @CurrentAdmin() admin: AdminContext,
    @Query() query: ListAdminArticlesQuery,
  ): Promise<Paginated<AdminArticleListItem>> {
    return this.articles.list(admin, query);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Read any article, including drafts' })
  @ApiOkEnvelope(AdminArticleDto)
  getArticle(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<AdminArticle> {
    return this.articles.get(admin, id);
  }

  @Post('articles')
  @ApiOperation({ summary: 'Create a draft' })
  createArticle(
    @CurrentAdmin() admin: AdminContext,
    @Body() input: ArticleInputDto,
  ): Promise<AdminArticle> {
    return this.articles.create(admin, input);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Save an article. Status is changed by publish and unpublish.' })
  @ApiOkEnvelope(ArticleChangeDto)
  updateArticle(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
    @Body() input: ArticleUpdateDto,
  ): Promise<ContentChange<AdminArticle>> {
    return this.articles.update(admin, id, input);
  }

  @Post('articles/:id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish now, or schedule with a future date' })
  @ApiOkEnvelope(ArticleChangeDto)
  publishArticle(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
    @Body() { publishedAt }: PublishArticleDto,
  ): Promise<ContentChange<AdminArticle>> {
    return this.articles.publish(admin, id, publishedAt);
  }

  @Post('articles/:id/unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Return an article to draft' })
  @ApiOkEnvelope(ArticleChangeDto)
  unpublishArticle(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<ContentChange<AdminArticle>> {
    return this.articles.unpublish(admin, id);
  }

  @Delete('articles/:id')
  @ApiOperation({ summary: 'Delete an article permanently' })
  deleteArticle(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<{ revalidated: boolean }> {
    return this.articles.delete(admin, id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiOkEnvelope(AdminCategoryDto, { isArray: true })
  listCategories(@CurrentAdmin() admin: AdminContext): Promise<AdminCategory[]> {
    return this.taxonomy.listCategories(admin);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Edit a category. Slugs are fixed because routes depend on them.' })
  updateCategory(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
    @Body() input: CategoryInputDto,
  ): Promise<ContentChange<AdminCategory>> {
    return this.taxonomy.updateCategory(admin, id, input);
  }

  @Get('tags')
  @ApiOperation({ summary: 'List tags with usage counts' })
  @ApiOkEnvelope(AdminTagDto, { isArray: true })
  listTags(@CurrentAdmin() admin: AdminContext): Promise<AdminTag[]> {
    return this.taxonomy.listTags(admin);
  }

  @Post('tags')
  @ApiOperation({ summary: 'Create a tag' })
  createTag(@CurrentAdmin() admin: AdminContext, @Body() input: TagInputDto): Promise<AdminTag> {
    return this.taxonomy.createTag(admin, input);
  }

  @Patch('tags/:id')
  @ApiOperation({ summary: 'Rename a tag' })
  updateTag(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
    @Body() input: TagInputDto,
  ): Promise<ContentChange<AdminTag>> {
    return this.taxonomy.updateTag(admin, id, input);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete a tag. Articles using it stay, without the tag.' })
  deleteTag(
    @CurrentAdmin() admin: AdminContext,
    @Param() { id }: ArticleIdParam,
  ): Promise<{ revalidated: boolean }> {
    return this.taxonomy.deleteTag(admin, id);
  }

  @Post('media/images')
  @ApiOperation({ summary: 'Upload a PNG, JPEG or WebP image, up to 5 MB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkEnvelope(UploadedImageDto)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }))
  uploadImage(
    @CurrentAdmin() admin: AdminContext,
    @UploadedFile() file: { buffer: Buffer } | undefined,
  ): Promise<UploadedImage> {
    return this.media.uploadImage(admin, file?.buffer);
  }
}
