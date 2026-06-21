import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { LearnerService } from '../../learner/learner.service';
import { QUEUE_SESSION_CONSOLIDATION } from '../queue.constants';
import {
  SessionConsolidationProcessor,
  SessionConsolidationJobData,
} from './session-consolidation.processor';

const mockPrisma = {
  profile: { update: jest.fn() },
  session: { update: jest.fn() },
};

const mockLearnerService = {
  getProfile: jest.fn(),
  upsertKnowledgeState: jest.fn(),
};

function makeJob(data: SessionConsolidationJobData): Job<SessionConsolidationJobData> {
  return { id: 'job-1', data } as unknown as Job<SessionConsolidationJobData>;
}

describe('SessionConsolidationProcessor', () => {
  let processor: SessionConsolidationProcessor;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.profile.update.mockResolvedValue({});
    mockPrisma.session.update.mockResolvedValue({});
    mockLearnerService.getProfile.mockResolvedValue({ calibrationScore: 0.0 });
    mockLearnerService.upsertKnowledgeState.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionConsolidationProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: LearnerService, useValue: mockLearnerService },
        { provide: getQueueToken(QUEUE_SESSION_CONSOLIDATION), useValue: {} },
      ],
    }).compile();

    processor = module.get<SessionConsolidationProcessor>(SessionConsolidationProcessor);
  });

  describe('process', () => {
    const BASE_DATA: SessionConsolidationJobData = {
      sessionId: 'session-uuid',
      learnerId: 'learner-uuid',
      topic: 'React hooks',
      calibrationDelta: 1.0,
      conceptsEngaged: ['useState', 'useEffect'],
    };

    it('updates calibration score by EMV formula', async () => {
      mockLearnerService.getProfile.mockResolvedValue({ calibrationScore: 0.5 });

      await processor.process(makeJob(BASE_DATA));

      // new = clamp(0.5 + 1.0 * 0.15, -2, 2) = 0.65
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'learner-uuid' },
        data: { calibrationScore: expect.closeTo(0.65, 5) },
      });
    });

    it('clamps calibration score at +2.0', async () => {
      mockLearnerService.getProfile.mockResolvedValue({ calibrationScore: 1.95 });

      await processor.process(makeJob({ ...BASE_DATA, calibrationDelta: 5.0 }));

      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'learner-uuid' },
        data: { calibrationScore: 2.0 },
      });
    });

    it('clamps calibration score at -2.0', async () => {
      mockLearnerService.getProfile.mockResolvedValue({ calibrationScore: -1.95 });

      await processor.process(makeJob({ ...BASE_DATA, calibrationDelta: -5.0 }));

      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'learner-uuid' },
        data: { calibrationScore: -2.0 },
      });
    });

    it('upserts FSRS with rating=2 for each concept', async () => {
      await processor.process(makeJob(BASE_DATA));

      expect(mockLearnerService.upsertKnowledgeState).toHaveBeenCalledTimes(2);
      expect(mockLearnerService.upsertKnowledgeState).toHaveBeenCalledWith(
        'learner-uuid', 'useState', 'React hooks', 2,
      );
      expect(mockLearnerService.upsertKnowledgeState).toHaveBeenCalledWith(
        'learner-uuid', 'useEffect', 'React hooks', 2,
      );
    });

    it('updates session.conceptsCovered', async () => {
      await processor.process(makeJob(BASE_DATA));

      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-uuid' },
        data: { conceptsCovered: ['useState', 'useEffect'] },
      });
    });

    it('skips FSRS upsert and session update when no concepts', async () => {
      await processor.process(makeJob({ ...BASE_DATA, conceptsEngaged: [] }));

      expect(mockLearnerService.upsertKnowledgeState).not.toHaveBeenCalled();
      expect(mockPrisma.session.update).not.toHaveBeenCalled();
    });
  });
});
