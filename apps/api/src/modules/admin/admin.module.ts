import { Module } from '@nestjs/common';
import { AdminGuard } from '../../common/auth/admin.guard.js';
import { AdminArticlesRepository } from './admin-articles.repository.js';
import { AdminArticlesService } from './admin-articles.service.js';
import { AdminController } from './admin.controller.js';
import { DashboardRepository } from './dashboard.repository.js';
import { LearningController } from './learning/learning.controller.js';
import { LearningRepository } from './learning/learning.repository.js';
import { LearningService } from './learning/learning.service.js';
import { MediaService } from './media.service.js';
import { RevalidationService } from './revalidation.service.js';
import { TaxonomyRepository } from './taxonomy.repository.js';
import { TaxonomyService } from './taxonomy.service.js';

@Module({
  controllers: [AdminController, LearningController],
  providers: [
    AdminGuard,
    AdminArticlesRepository,
    AdminArticlesService,
    DashboardRepository,
    LearningRepository,
    LearningService,
    MediaService,
    RevalidationService,
    TaxonomyRepository,
    TaxonomyService,
  ],
})
export class AdminModule {}
