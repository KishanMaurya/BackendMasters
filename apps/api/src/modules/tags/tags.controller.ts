import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TagSummary } from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import { TagDto } from './dto/tag.dto.js';
import { TagsRepository } from './tags.repository.js';

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
}
