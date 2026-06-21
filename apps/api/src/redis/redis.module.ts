import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { type AppConfig } from '../config/configuration';
import { REDIS_CLIENT, RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService<AppConfig, true>): IORedis => {
        const url = configService.get('redis', { infer: true }).url;
        return new IORedis(url, {
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          lazyConnect: true,
          connectTimeout: 5000,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
