import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotEquals,
} from 'class-validator';
import {
  ARTICLE_STATES,
  CATEGORY_SLUGS,
  RESERVED_ARTICLE_SLUGS,
  type ArticleInput,
  type ArticleState,
  type ArticleUpdateInput,
  type CategorySlug,
  type Difficulty,
} from '@backendmasters/shared';
import { SLUG_PATTERN } from '../../articles/dto/list-articles.query.js';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ArticleInputDto implements ArticleInput {
  @ApiProperty({ example: 'cache-stampede-explained' })
  @Matches(SLUG_PATTERN, { message: 'slug must use lowercase letters, numbers and hyphens' })
  @MaxLength(120)
  @NotEquals(RESERVED_ARTICLE_SLUGS[0], { message: 'That slug is reserved' })
  slug: string;

  @ApiProperty({ example: 'What Is a Cache Stampede?' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(200_000)
  content: string;

  @ApiProperty({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  coverImageUrl: string | null;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ enum: DIFFICULTIES, nullable: true })
  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty: Difficulty | null;

  @ApiProperty({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle: string | null;

  @ApiProperty({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription: string | null;

  @ApiProperty()
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  tagIds: string[];
}

export class ArticleUpdateDto extends ArticleInputDto implements ArticleUpdateInput {
  @ApiProperty({ description: 'The updatedAt value the editor loaded' })
  @IsISO8601()
  expectedUpdatedAt: string;
}

export class PublishArticleDto {
  @ApiPropertyOptional({
    description: 'A future date schedules the article. Leave out to publish now.',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  publishedAt?: string;
}

export class ListAdminArticlesQuery {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 20;

  @ApiPropertyOptional({ enum: ARTICLE_STATES })
  @IsOptional()
  @IsIn(ARTICLE_STATES)
  state?: ArticleState;

  @ApiPropertyOptional({ enum: CATEGORY_SLUGS })
  @IsOptional()
  @IsIn(CATEGORY_SLUGS)
  category?: CategorySlug;

  @ApiPropertyOptional({ description: 'Matches part of the title' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class ArticleIdParam {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id: string;
}
