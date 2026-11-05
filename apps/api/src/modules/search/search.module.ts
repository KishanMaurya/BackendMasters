import { Module } from '@nestjs/common';
import { SearchController } from './search.controller.js';
import { SearchRepository } from './search.repository.js';

@Module({
  controllers: [SearchController],
  providers: [SearchRepository],
})
export class SearchModule {}
