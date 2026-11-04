import { ApiProperty } from '@nestjs/swagger';
import { CATEGORY_SLUGS, type CategorySlug, type CategorySummary } from '@backendmasters/shared';

export class CategoryDto implements CategorySummary {
  @ApiProperty({ enum: CATEGORY_SLUGS })
  slug: CategorySlug;

  @ApiProperty({ example: 'High-Level Design' })
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ description: 'Published articles in this category', example: 4 })
  articleCount: number;
}
