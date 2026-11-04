import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthStatus } from '@backendmasters/shared';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Service and dependency status' })
  @ApiOkResponse({ type: HealthResponseDto })
  getStatus(): Promise<HealthStatus> {
    return this.health.getStatus();
  }
}
