import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Session } from '@dersify/database';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  QUEUE_SESSION_CONSOLIDATION,
  QUEUE_SESSION_EXPIRY_CHECK,
} from '../queue.constants';
import type { SessionConsolidationJobData } from './session-consolidation.processor';

const EXPIRY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_SESSIONS_PER_RUN = 50;

function insightsKey(sessionId: string): string {
  return `dersify:insights:${sessionId}`;
}

@Processor(QUEUE_SESSION_EXPIRY_CHECK)
@Injectable()
export class SessionExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(SessionExpiryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @InjectQueue(QUEUE_SESSION_CONSOLIDATION)
    private readonly consolidationQueue: Queue<SessionConsolidationJobData>,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const cutoff = new Date(Date.now() - EXPIRY_WINDOW_MS);

    const staleSessions = await this.prisma.session.findMany({
      where: {
        endedAt: null,
        lastActivityAt: { lt: cutoff },
      },
      take: MAX_SESSIONS_PER_RUN,
      orderBy: { lastActivityAt: 'asc' },
    });

    if (staleSessions.length === 0) return;

    this.logger.log('session_expiry_check', { count: staleSessions.length });

    await Promise.allSettled(
      staleSessions.map(async (session: Session) => {
        try {
          await this.prisma.session.update({
            where: { id: session.id },
            data: { endedAt: new Date() },
          });

          await this.consolidationQueue.add(
            'consolidate',
            {
              sessionId: session.id,
              learnerId: session.learnerId,
              topic: session.topic,
              calibrationDelta: 0,
              conceptsEngaged: session.conceptsCovered,
            },
            { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
          );

          await this.redisService.del(insightsKey(session.id));

          this.logger.log('session_expired', { sessionId: session.id, learnerId: session.learnerId });
        } catch (err: unknown) {
          this.logger.error('session_expiry_individual_failed', {
            sessionId: session.id,
            reason: err instanceof Error ? err.message : String(err),
          });
        }
      }),
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error('session_expiry_job_failed', {
      jobId: job.id,
      reason: error.message,
    });
  }
}
