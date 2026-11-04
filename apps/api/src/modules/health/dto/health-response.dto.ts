import { ApiProperty } from '@nestjs/swagger';
import type { DependencyStatus, HealthStatus } from '@backendmasters/shared';

class HealthDependenciesDto {
  @ApiProperty({ enum: ['ok', 'not_configured', 'unreachable'] })
  supabase: DependencyStatus;
}

export class HealthDto implements HealthStatus {
  @ApiProperty({ enum: ['ok', 'degraded'] })
  status: 'ok' | 'degraded';

  @ApiProperty({ example: '0.1.0' })
  version: string;

  @ApiProperty({ example: 42 })
  uptimeSeconds: number;

  @ApiProperty({ type: HealthDependenciesDto })
  dependencies: HealthDependenciesDto;
}

class ResponseMetaDto {
  @ApiProperty()
  requestId: string;

  @ApiProperty()
  timestamp: string;
}

export class HealthResponseDto {
  @ApiProperty({ type: HealthDto })
  data: HealthDto;

  @ApiProperty({ type: ResponseMetaDto })
  meta: ResponseMetaDto;
}
