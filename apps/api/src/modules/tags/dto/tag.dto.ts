import { ApiProperty } from '@nestjs/swagger';
import type { TagSummary, TagUsage } from '@backendmasters/shared';

export class TagDto implements TagSummary {
  @ApiProperty({ example: 'caching' })
  slug: string;

  @ApiProperty({ example: 'Caching' })
  name: string;
}

export class TagUsageDto implements TagUsage {
  @ApiProperty({ example: 'caching' })
  slug: string;

  @ApiProperty({ example: 3 })
  articleCount: number;
}
