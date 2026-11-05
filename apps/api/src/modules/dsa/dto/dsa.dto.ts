import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  DSA_TOPIC_SLUGS,
  type Difficulty,
  type DsaExample,
  type DsaProblemDetail,
  type DsaProblemSummary,
  type DsaSolutions,
  type DsaTopic,
  type DsaTopicCount,
} from '@backendmasters/shared';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export class ListDsaProblemsQuery {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 20;

  @ApiPropertyOptional({ enum: DSA_TOPIC_SLUGS })
  @IsOptional()
  @IsIn(DSA_TOPIC_SLUGS)
  topic?: DsaTopic;

  @ApiPropertyOptional({ enum: DIFFICULTIES })
  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty?: Difficulty;
}

export class DsaProblemSummaryDto implements DsaProblemSummary {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'two-sum' })
  slug: string;

  @ApiProperty({ example: 'Two Sum' })
  title: string;

  @ApiProperty({ enum: DSA_TOPIC_SLUGS })
  topic: DsaTopic;

  @ApiProperty({ enum: DIFFICULTIES })
  difficulty: Difficulty;
}

class DsaExampleDto implements DsaExample {
  @ApiProperty()
  input: string;

  @ApiProperty()
  output: string;

  @ApiPropertyOptional()
  explanation?: string;
}

class DsaSolutionsDto implements DsaSolutions {
  @ApiProperty()
  javascript: string;

  @ApiProperty()
  typescript: string;

  @ApiProperty()
  java: string;

  @ApiProperty()
  go: string;
}

export class DsaProblemDetailDto extends DsaProblemSummaryDto implements DsaProblemDetail {
  @ApiProperty({ description: 'Markdown' })
  problemStatement: string;

  @ApiProperty({ type: [DsaExampleDto] })
  examples: DsaExample[];

  @ApiProperty({ type: [String] })
  constraints: string[];

  @ApiProperty({ description: 'Markdown' })
  bruteForceApproach: string;

  @ApiProperty({ description: 'Markdown' })
  optimizedApproach: string;

  @ApiProperty({ description: 'Markdown' })
  explanation: string;

  @ApiProperty({ example: 'O(n)' })
  timeComplexity: string;

  @ApiProperty({ example: 'O(n)' })
  spaceComplexity: string;

  @ApiProperty({ description: 'Markdown' })
  dryRun: string;

  @ApiProperty({ type: DsaSolutionsDto })
  solutions: DsaSolutions;

  @ApiProperty()
  publishedAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class DsaTopicCountDto implements DsaTopicCount {
  @ApiProperty({ enum: DSA_TOPIC_SLUGS })
  topic: DsaTopic;

  @ApiProperty()
  count: number;
}
