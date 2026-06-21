import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AiModule } from '../ai/ai.module';
import { type AppConfig } from '../config/configuration';
import { RagService } from './rag.service';

@Module({
  imports: [AiModule, ConfigModule],
  providers: [
    {
      provide: 'RAG_REDIS',
      useFactory: (configService: ConfigService<AppConfig, true>): Redis => {
        const url = configService.get('redis', { infer: true }).url;
        return new Redis(url, { maxRetriesPerRequest: null, lazyConnect: true });
      },
      inject: [ConfigService],
    },
    RagService,
  ],
  exports: [RagService],
})
export class RagModule {}
