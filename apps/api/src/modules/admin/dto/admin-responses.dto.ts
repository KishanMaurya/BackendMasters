import { ApiProperty } from '@nestjs/swagger';
import {
  ARTICLE_STATES,
  CATEGORY_SLUGS,
  type AdminArticle,
  type AdminArticleListItem,
  type AdminCategory,
  type AdminIdentity,
  type AdminTag,
  type ArticleState,
  type CategorySlug,
  type DashboardStats,
  type Difficulty,
  type UploadedImage,
} from '@backendmasters/shared';

export class AdminIdentityDto implements AdminIdentity {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  displayName: string;
}

export class AdminArticleListItemDto implements AdminArticleListItem {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ARTICLE_STATES })
  state: ArticleState;

  @ApiProperty({ enum: CATEGORY_SLUGS })
  categorySlug: CategorySlug;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty({ nullable: true, type: String })
  publishedAt: string | null;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  readingTimeMinutes: number;
}

export class AdminArticleDto extends AdminArticleListItemDto implements AdminArticle {
  @ApiProperty()
  description: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true, type: String })
  coverImageUrl: string | null;

  @ApiProperty({ format: 'uuid' })
  categoryId: string;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'], nullable: true })
  difficulty: Difficulty | null;

  @ApiProperty({ nullable: true, type: String })
  seoTitle: string | null;

  @ApiProperty({ nullable: true, type: String })
  seoDescription: string | null;

  @ApiProperty({ type: [String] })
  tagIds: string[];
}

export class ArticleChangeDto {
  @ApiProperty({ type: AdminArticleDto })
  result: AdminArticle;

  @ApiProperty({ description: 'False when the live site could not be told about the change' })
  revalidated: boolean;
}

export class AdminCategoryDto implements AdminCategory {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: CATEGORY_SLUGS })
  slug: CategorySlug;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ description: 'Published articles' })
  articleCount: number;
}

export class AdminTagDto implements AdminTag {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'All articles using it, including drafts' })
  articleCount: number;
}

class ArticleCountsDto {
  @ApiProperty()
  published: number;

  @ApiProperty()
  scheduled: number;

  @ApiProperty()
  drafts: number;

  @ApiProperty()
  featured: number;
}

class ViewCountsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  last30Days: number;
}

export class DashboardStatsDto implements DashboardStats {
  @ApiProperty({ type: ArticleCountsDto })
  articles: ArticleCountsDto;

  @ApiProperty({ type: ViewCountsDto })
  views: ViewCountsDto;

  @ApiProperty()
  categories: number;

  @ApiProperty()
  tags: number;

  @ApiProperty()
  dsaProblems: number;

  @ApiProperty()
  interviewQuestions: number;

  @ApiProperty({ type: [AdminArticleListItemDto] })
  recent: AdminArticleListItem[];
}

export class UploadedImageDto implements UploadedImage {
  @ApiProperty()
  url: string;
}
