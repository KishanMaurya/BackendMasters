import { ApiProperty } from '@nestjs/swagger';
import type { TagSummary } from '@backendmasters/shared';

export class TagDto implements TagSummary {
  @ApiProperty({ example: 'caching' })
  slug: string;

  @ApiProperty({ example: 'Caching' })
  name: string;
}
