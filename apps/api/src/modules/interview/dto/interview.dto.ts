import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type {
  Difficulty,
  InterviewFacets,
  InterviewQuestionDetail,
  InterviewQuestionSummary,
} from '@backendmasters/shared';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ListInterviewQuestionsQuery {
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

  @ApiPropertyOptional({ description: 'Words to search for in questions and answers' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ example: 'Node.js' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  technology?: string;

  @ApiPropertyOptional({ example: 'Concurrency' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  topic?: string;

  @ApiPropertyOptional({ enum: DIFFICULTIES })
  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ example: 'Concepts' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  interviewCategory?: string;
}

export class InterviewQuestionSummaryDto implements InterviewQuestionSummary {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ example: 'Node.js' })
  technology: string;

  @ApiProperty({ example: 'Concurrency' })
  topic: string;

  @ApiProperty({ nullable: true, type: String })
  interviewCategory: string | null;

  @ApiProperty({ enum: DIFFICULTIES })
  difficulty: Difficulty;

  @ApiProperty({ description: 'Markdown' })
  shortAnswer: string;
}

export class InterviewQuestionDetailDto
  extends InterviewQuestionSummaryDto
  implements InterviewQuestionDetail
{
  @ApiProperty({ description: 'Markdown' })
  detailedExplanation: string;

  @ApiProperty({ description: 'Markdown' })
  practicalExample: string;

  @ApiProperty({ nullable: true, type: String })
  codeExample: string | null;

  @ApiProperty({ nullable: true, type: String })
  codeLanguage: string | null;

  @ApiProperty({ type: [InterviewQuestionSummaryDto] })
  related: InterviewQuestionSummary[];

  @ApiProperty()
  publishedAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class InterviewFacetsDto implements InterviewFacets {
  @ApiProperty({ type: [String] })
  technologies: string[];

  @ApiProperty({ type: [String] })
  topics: string[];

  @ApiProperty({ type: [String] })
  interviewCategories: string[];
}
