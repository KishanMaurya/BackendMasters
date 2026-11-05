import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { AdminDsaProblem, AdminInterviewQuestion } from '@backendmasters/shared';
import type { AdminContext } from '../../../common/auth/admin.guard.js';
import { countTopics } from '../../dsa/dsa.controller.js';
import { distinct } from '../../interview/interview.repository.js';
import type { RevalidationService } from '../revalidation.service.js';
import type { LearningRepository } from './learning.repository.js';
import { LearningService, missingForPublish } from './learning.service.js';

const ADMIN: AdminContext = { id: 'admin', accessToken: 'token' };

const PROBLEM = {
  id: 'id',
  status: 'draft',
  publishedAt: null,
  problemStatement: 'Statement',
  examples: [{ input: 'a', output: 'b' }],
  optimizedApproach: 'Approach',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  solutions: { javascript: 'x', typescript: 'x', java: 'x', go: 'x' },
} as AdminDsaProblem;

function setup(problem: AdminDsaProblem | null = PROBLEM) {
  const repository = {
    findDsa: vi.fn(() => Promise.resolve(problem)),
    updateDsa: vi.fn(() => Promise.resolve(problem)),
    setDsaStatus: vi.fn(() => Promise.resolve(problem !== null)),
    deleteDsa: vi.fn(() => Promise.resolve(problem !== null)),
    findQuestion: vi.fn(() =>
      Promise.resolve({ id: 'q', shortAnswer: ' ', publishedAt: null } as AdminInterviewQuestion),
    ),
    setQuestionStatus: vi.fn(() => Promise.resolve(true)),
  };
  const revalidation = { revalidateContent: vi.fn(() => Promise.resolve(true)) };
  const service = new LearningService(
    repository as unknown as LearningRepository,
    revalidation as unknown as RevalidationService,
  );
  return { service, repository, revalidation };
}

describe('missingForPublish', () => {
  it('finds nothing missing in a complete problem', () => {
    expect(missingForPublish(PROBLEM)).toEqual([]);
  });

  it('names each language that is missing', () => {
    const solutions = { javascript: 'x', typescript: ' ', java: 'x', go: '' };
    expect(missingForPublish({ ...PROBLEM, solutions })).toEqual([
      'TypeScript solution',
      'Go solution',
    ]);
  });

  it('requires an example and the core sections', () => {
    const missing = missingForPublish({ ...PROBLEM, examples: [], timeComplexity: '' });
    expect(missing).toEqual(['an example', 'time complexity']);
  });
});

describe('LearningService', () => {
  it('refuses to publish an incomplete problem, and says what is missing', async () => {
    const { service, repository } = setup({ ...PROBLEM, problemStatement: '' });
    await expect(service.publishDsa(ADMIN, 'id')).rejects.toThrow(/problem statement/);
    await expect(service.publishDsa(ADMIN, 'id')).rejects.toThrow(UnprocessableEntityException);
    expect(repository.setDsaStatus).not.toHaveBeenCalled();
  });

  it('publishes a complete problem and refreshes the site', async () => {
    const { service, repository, revalidation } = setup();
    await service.publishDsa(ADMIN, 'id');
    expect(repository.setDsaStatus).toHaveBeenCalledWith(
      ADMIN,
      'id',
      expect.objectContaining({ status: 'published' }),
    );
    expect(revalidation.revalidateContent).toHaveBeenCalledOnce();
  });

  it('does not refresh the site for a draft', async () => {
    const { service, revalidation } = setup();
    const { revalidated } = await service.updateDsa(ADMIN, 'id', {
      ...PROBLEM,
      expectedUpdatedAt: 't',
    });
    expect(revalidation.revalidateContent).not.toHaveBeenCalled();
    expect(revalidated).toBe(true);
  });

  it('refreshes the site when a published problem changes', async () => {
    const { service, revalidation } = setup({ ...PROBLEM, status: 'published' });
    await service.updateDsa(ADMIN, 'id', { ...PROBLEM, expectedUpdatedAt: 't' });
    expect(revalidation.revalidateContent).toHaveBeenCalledOnce();
  });

  it('refuses to publish a question without a short answer', async () => {
    const { service, repository } = setup();
    await expect(service.publishQuestion(ADMIN, 'q')).rejects.toThrow(UnprocessableEntityException);
    expect(repository.setQuestionStatus).not.toHaveBeenCalled();
  });

  it('reports a missing problem', async () => {
    const { service } = setup(null);
    await expect(service.getDsa(ADMIN, 'id')).rejects.toThrow(NotFoundException);
    await expect(service.unpublishDsa(ADMIN, 'id')).rejects.toThrow(NotFoundException);
    await expect(service.deleteDsa(ADMIN, 'id')).rejects.toThrow(NotFoundException);
  });
});

describe('countTopics', () => {
  it('counts in module order and leaves out empty topics', () => {
    expect(countTopics(['graphs', 'arrays', 'graphs'])).toEqual([
      { topic: 'arrays', count: 1 },
      { topic: 'graphs', count: 2 },
    ]);
  });

  it('ignores a topic the module does not know', () => {
    expect(countTopics(['alchemy'])).toEqual([]);
  });
});

describe('distinct', () => {
  it('removes blanks and duplicates, and sorts', () => {
    expect(distinct(['b', null, 'a', 'b', ''])).toEqual(['a', 'b']);
  });
});
