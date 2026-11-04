import type { ComponentType } from 'react';
import type { CategorySlug } from '@backendmasters/shared';
import { AwsIllustration } from './aws-illustration';
import { BackendIllustration } from './backend-illustration';
import { DsaIllustration } from './dsa-illustration';
import { HldIllustration } from './hld-illustration';
import { InterviewIllustration } from './interview-illustration';
import { LldIllustration } from './lld-illustration';
import { ObservabilityIllustration } from './observability-illustration';
import type { IllustrationProps } from './primitives';
import { SystemDesignIllustration } from './system-design-illustration';

export { ApiIllustration } from './api-illustration';
export { InterviewIllustration } from './interview-illustration';
export { DatabaseIllustration } from './database-illustration';
export { DistributedSystemsIllustration } from './distributed-systems-illustration';
export { KafkaIllustration } from './kafka-illustration';

export const CATEGORY_ILLUSTRATIONS: Record<CategorySlug, ComponentType<IllustrationProps>> = {
  dsa: DsaIllustration,
  lld: LldIllustration,
  hld: HldIllustration,
  'system-design': SystemDesignIllustration,
  aws: AwsIllustration,
  observability: ObservabilityIllustration,
  'backend-engineering': BackendIllustration,
  'interview-questions': InterviewIllustration,
};
