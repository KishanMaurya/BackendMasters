import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller.js';
import { TagsRepository } from './tags.repository.js';

@Module({
  controllers: [TagsController],
  providers: [TagsRepository],
})
export class TagsModule {}
