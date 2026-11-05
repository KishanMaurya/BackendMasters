import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  CATEGORY_SLUGS,
  type CategorySlug,
  type TagSummary,
  type TagUsage,
} from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import { TagDto, TagUsageDto } from './dto/tag.dto.js';
import { TagsRepository } from './tags.repository.js';

class TagUsageQuery {
  @ApiProperty({ enum: CATEGORY_SLUGS })
  @IsIn(CATEGORY_SLUGS)
  category: CategorySlug;
}

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsRepository) {}

  @Get()
  @ApiOperation({ summary: 'List tags' })
  @ApiOkEnvelope(TagDto, { isArray: true })
  list(): Promise<TagSummary[]> {
    return this.tags.findAll();
  }

  @Get('usage')
  @ApiOperation({ summary: 'Published articles per tag within a category' })
  @ApiOkEnvelope(TagUsageDto, { isArray: true })
  usage(@Query() { category }: TagUsageQuery): Promise<TagUsage[]> {
    return this.tags.findUsage(category);
  }
}
