import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { SLUG_PATTERN } from './list-articles.query.js';

export class SlugParam {
  @ApiProperty({ example: 'cache-stampede-explained' })
  @Matches(SLUG_PATTERN)
  slug: string;
}
