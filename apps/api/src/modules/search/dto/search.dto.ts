import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  CATEGORY_SLUGS,
  type CategorySlug,
  type ContentKind,
  type Difficulty,
  type SearchResult,
  type SearchSuggestion,
  type SitemapEntry,
} from '@backendmasters/shared';
import { SLUG_PATTERN } from '../../articles/dto/list-articles.query.js';

const KINDS: readonly ContentKind[] = ['article', 'problem', 'question'];
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class SearchQuery {
  @ApiProperty({ description: 'Words to search for', example: 'load balancer' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  q: string;

  @ApiPropertyOptional({ enum: CATEGORY_SLUGS })
  @IsOptional()
  @IsIn(CATEGORY_SLUGS)
  category?: CategorySlug;

  @ApiPropertyOptional({ description: 'Only articles carry tags', example: 'caching' })
  @IsOptional()
  @Matches(SLUG_PATTERN)
  tag?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 12;
}

export class SuggestionsQuery {
  @ApiProperty({ description: 'What has been typed so far', example: 'cach' })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q: string;
}

export class SearchResultDto implements SearchResult {
  @ApiProperty({ enum: KINDS })
  kind: ContentKind;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ description: 'Plain text' })
  description: string;

  @ApiProperty({ enum: CATEGORY_SLUGS })
  categorySlug: CategorySlug;

  @ApiProperty()
  categoryName: string;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'], nullable: true })
  difficulty: Difficulty | null;
}

export class SearchSuggestionDto implements SearchSuggestion {
  @ApiProperty({ enum: KINDS })
  kind: ContentKind;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;
}

export class SitemapEntryDto implements SitemapEntry {
  @ApiProperty({ enum: KINDS })
  kind: ContentKind;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  updatedAt: string;
}
