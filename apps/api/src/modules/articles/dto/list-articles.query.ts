import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { CATEGORY_SLUGS, type CategorySlug, type Difficulty } from '@backendmasters/shared';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class ListArticlesQuery {
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

  @ApiPropertyOptional({ enum: CATEGORY_SLUGS })
  @IsOptional()
  @IsIn(CATEGORY_SLUGS)
  category?: CategorySlug;

  @ApiPropertyOptional({ example: 'caching' })
  @IsOptional()
  @Matches(SLUG_PATTERN)
  tag?: string;

  @ApiPropertyOptional({ enum: DIFFICULTIES })
  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ description: 'Only featured articles (true) or only others (false)' })
  @IsOptional()
  // Boolean("false") is true, so the two valid strings are mapped by hand.
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  featured?: boolean;
}
