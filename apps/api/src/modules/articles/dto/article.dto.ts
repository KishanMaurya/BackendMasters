import { ApiProperty } from '@nestjs/swagger';
import {
  CATEGORY_SLUGS,
  type ArticleAuthor,
  type ArticleDetail,
  type ArticleSummary,
  type CategorySlug,
  type Difficulty,
} from '@backendmasters/shared';
import { TagDto } from '../../tags/dto/tag.dto.js';

class AuthorDto implements ArticleAuthor {
  @ApiProperty()
  displayName: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class ArticleSummaryDto implements ArticleSummary {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: CATEGORY_SLUGS })
  categorySlug: CategorySlug;

  @ApiProperty()
  categoryName: string;

  @ApiProperty({ type: String, nullable: true })
  coverImageUrl: string | null;

  @ApiProperty({ example: 8 })
  readingTimeMinutes: number;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'], nullable: true })
  difficulty: Difficulty | null;

  @ApiProperty({ format: 'date-time' })
  publishedAt: string;

  @ApiProperty()
  isFeatured: boolean;
}

export class ArticleDetailDto extends ArticleSummaryDto implements ArticleDetail {
  @ApiProperty({ description: 'Markdown source' })
  content: string;

  @ApiProperty({ type: [TagDto] })
  tags: TagDto[];

  @ApiProperty({ type: AuthorDto, nullable: true })
  author: AuthorDto | null;

  @ApiProperty({ type: String, nullable: true })
  seoTitle: string | null;

  @ApiProperty({ type: String, nullable: true })
  seoDescription: string | null;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
