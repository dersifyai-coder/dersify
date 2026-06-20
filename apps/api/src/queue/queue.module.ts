import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  QUEUE_CONCEPT_NORMALIZATION,
  QUEUE_COST_MONITOR,
  QUEUE_DAILY_REVIEW_REMINDER,
  QUEUE_EMBEDDING_GENERATION,
  QUEUE_SESSION_CONSOLIDATION,
  QUEUE_SESSION_EXPIRY_CHECK,
  QUEUE_USAGE_SYNC,
  QUEUE_WEEKLY_DIGEST,
} from './queue.constants';
import { EmbeddingProcessor } from './processors/embedding.processor';
import { SessionConsolidationProcessor } from './processors/session-consolidation.processor';
import { SessionExpiryProcessor } from './processors/session-expiry.processor';
import { AiModule } from '../ai/ai.module';
import { LearnerModule } from '../learner/learner.module';
import { RedisModule } from '../redis/redis.module';
import { type AppConfig } from '../config/configuration';

const EXPIRY_CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
class ExpiryJobScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUE_SESSION_EXPIRY_CHECK)
    private readonly expiryQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.expiryQueue.add(
      'expire-sessions',
      {},
      {
        repeat: { every: EXPIRY_CHECK_INTERVAL_MS },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    );
  }
}

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        connection: {
          url: configService.get('redis', { infer: true }).url,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMBEDDING_GENERATION },
      { name: QUEUE_CONCEPT_NORMALIZATION },
      { name: QUEUE_WEEKLY_DIGEST },
      { name: QUEUE_DAILY_REVIEW_REMINDER },
      { name: QUEUE_USAGE_SYNC },
      { name: QUEUE_COST_MONITOR },
      { name: QUEUE_SESSION_CONSOLIDATION },
      { name: QUEUE_SESSION_EXPIRY_CHECK },
    ),
    AiModule,
    LearnerModule,
    RedisModule,
  ],
  providers: [
    EmbeddingProcessor,
    SessionConsolidationProcessor,
    SessionExpiryProcessor,
    ExpiryJobScheduler,
  ],
  exports: [BullModule],
})
export class QueueModule {}
