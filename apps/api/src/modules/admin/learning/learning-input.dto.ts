import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import {
  DSA_TOPIC_SLUGS,
  RESERVED_DSA_SLUGS,
  RESERVED_QUESTION_SLUGS,
  type Difficulty,
  type DsaExample,
  type DsaProblemInput,
  type DsaSolutions,
  type DsaTopic,
  type InterviewQuestionInput,
} from '@backendmasters/shared';
import { SLUG_PATTERN } from '../../articles/dto/list-articles.query.js';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
const SOURCE_LIMIT = 50_000;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const SLUG_MESSAGE = 'slug must use lowercase letters, numbers and hyphens';

class DsaExampleInput implements DsaExample {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  input: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  output: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;
}

class DsaSolutionsInput implements DsaSolutions {
  @ApiProperty()
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  javascript: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  typescript: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  java: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  go: string;
}

export class DsaProblemInputDto implements DsaProblemInput {
  @ApiProperty({ example: 'two-sum' })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(120)
  @NotEquals(RESERVED_DSA_SLUGS[0], { message: 'That slug is reserved' })
  @NotEquals(RESERVED_DSA_SLUGS[1], { message: 'That slug is reserved' })
  slug: string;

  @ApiProperty({ example: 'Two Sum' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ enum: DSA_TOPIC_SLUGS })
  @IsIn(DSA_TOPIC_SLUGS)
  topic: DsaTopic;

  @ApiProperty({ enum: DIFFICULTIES })
  @IsIn(DIFFICULTIES)
  difficulty: Difficulty;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  problemStatement: string;

  @ApiProperty({ type: [DsaExampleInput] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => DsaExampleInput)
  examples: DsaExample[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  constraints: string[];

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  bruteForceApproach: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  optimizedApproach: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  explanation: string;

  @ApiProperty({ example: 'O(n)' })
  @IsString()
  @MaxLength(200)
  timeComplexity: string;

  @ApiProperty({ example: 'O(n)' })
  @IsString()
  @MaxLength(200)
  spaceComplexity: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  dryRun: string;

  @ApiProperty({ type: DsaSolutionsInput })
  @ValidateNested()
  @Type(() => DsaSolutionsInput)
  solutions: DsaSolutions;
}

export class DsaProblemUpdateDto extends DsaProblemInputDto {
  @ApiProperty({ description: 'The updatedAt value the editor loaded' })
  @IsISO8601()
  expectedUpdatedAt: string;
}

export class InterviewQuestionInputDto implements InterviewQuestionInput {
  @ApiProperty()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(120)
  @NotEquals(RESERVED_QUESTION_SLUGS[0], { message: 'That slug is reserved' })
  @NotEquals(RESERVED_QUESTION_SLUGS[1], { message: 'That slug is reserved' })
  slug: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @ApiProperty({ example: 'Node.js' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  technology: string;

  @ApiProperty({ example: 'Concurrency' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  topic: string;

  @ApiProperty({ nullable: true, type: String, example: 'Concepts' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  interviewCategory: string | null;

  @ApiProperty({ enum: DIFFICULTIES })
  @IsIn(DIFFICULTIES)
  difficulty: Difficulty;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(5000)
  shortAnswer: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  detailedExplanation: string;

  @ApiProperty({ description: 'Markdown' })
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  practicalExample: string;

  @ApiProperty({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SOURCE_LIMIT)
  codeExample: string | null;

  @ApiProperty({ nullable: true, type: String, example: 'typescript' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codeLanguage: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  relatedQuestionIds: string[];
}

export class InterviewQuestionUpdateDto extends InterviewQuestionInputDto {
  @ApiProperty({ description: 'The updatedAt value the editor loaded' })
  @IsISO8601()
  expectedUpdatedAt: string;
}
