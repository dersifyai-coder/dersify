import { Injectable, Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { LearnerService } from '../../learner/learner.service';
import { QUEUE_SESSION_CONSOLIDATION } from '../queue.constants';

export interface SessionConsolidationJobData {
  sessionId: string;
  learnerId: string;
  topic: string;
  calibrationDelta: number;
  conceptsEngaged: string[];
}

const CALIBRATION_LEARNING_RATE = 0.15;
const CALIBRATION_MIN = -2.0;
const CALIBRATION_MAX = 2.0;

@Processor(QUEUE_SESSION_CONSOLIDATION)
@Injectable()
export class SessionConsolidationProcessor extends WorkerHost {
  private readonly logger = new Logger(SessionConsolidationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly learnerService: LearnerService,
  ) {
    super();
  }

  async process(job: Job<SessionConsolidationJobData>): Promise<void> {
    const { sessionId, learnerId, topic, calibrationDelta, conceptsEngaged } = job.data;

    // Update calibration score: EMV formula clamped to [-2, +2]
    const profile = await this.learnerService.getProfile(learnerId);
    const newCalibration = Math.max(
      CALIBRATION_MIN,
      Math.min(
        CALIBRATION_MAX,
        profile.calibrationScore + calibrationDelta * CALIBRATION_LEARNING_RATE,
      ),
    );

    await this.prisma.profile.update({
      where: { id: learnerId },
      data: { calibrationScore: newCalibration },
    });

    if (conceptsEngaged.length > 0) {
      // FSRS rating 2 = Hard (seen but not fully tested)
      await Promise.all(
        conceptsEngaged.map((conceptId) =>
          this.learnerService.upsertKnowledgeState(learnerId, conceptId, topic, 2),
        ),
      );

      await this.prisma.session.update({
        where: { id: sessionId },
        data: { conceptsCovered: conceptsEngaged },
      });
    }

    this.logger.log('session_consolidation_complete', {
      sessionId,
      learnerId,
      conceptsCount: conceptsEngaged.length,
      calibrationApplied: newCalibration - profile.calibrationScore,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SessionConsolidationJobData>, error: Error): void {
    this.logger.error('session_consolidation_failed', {
      jobId: job.id,
      sessionId: job.data.sessionId,
      reason: error.message,
    });
  }
}
