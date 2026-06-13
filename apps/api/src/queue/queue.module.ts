import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  QUEUE_CONCEPT_NORMALIZATION,
  QUEUE_COST_MONITOR,
  QUEUE_DAILY_REVIEW_REMINDER,
  QUEUE_EMBEDDING_GENERATION,
  QUEUE_USAGE_SYNC,
  QUEUE_WEEKLY_DIGEST,
} from './queue.constants';
import { EmbeddingProcessor } from './processors/embedding.processor';
import { AiModule } from '../ai/ai.module';
import { type AppConfig } from '../config/configuration';

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
    ),
    AiModule,
  ],
  providers: [EmbeddingProcessor],
  exports: [BullModule],
})
export class QueueModule {}
