import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CategorySummary } from '@backendmasters/shared';
import { ApiOkEnvelope } from '../../common/http/api-envelope.decorator.js';
import { CategoriesRepository } from './categories.repository.js';
import { CategoryDto } from './dto/category.dto.js';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesRepository) {}

  @Get()
  @ApiOperation({ summary: 'List categories with published article counts' })
  @ApiOkEnvelope(CategoryDto, { isArray: true })
  list(): Promise<CategorySummary[]> {
    return this.categories.findAll();
  }
}
