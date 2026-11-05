import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import type { CategoryInput, TagInput } from '@backendmasters/shared';
import { SLUG_PATTERN } from '../../articles/dto/list-articles.query.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CategoryInputDto implements CategoryInput {
  @ApiProperty({ example: 'High-Level Design' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder: number;
}

export class TagInputDto implements TagInput {
  @ApiProperty({ example: 'load-balancing' })
  @Matches(SLUG_PATTERN, { message: 'slug must use lowercase letters, numbers and hyphens' })
  @MaxLength(80)
  slug: string;

  @ApiProperty({ example: 'Load Balancing' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;
}
