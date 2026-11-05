import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller.js';
import { InterviewRepository } from './interview.repository.js';

@Module({
  controllers: [InterviewController],
  providers: [InterviewRepository],
})
export class InterviewModule {}
