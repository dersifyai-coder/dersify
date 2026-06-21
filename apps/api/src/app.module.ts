import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { ConceptRegistryModule } from './concept-registry/concept-registry.module';
import { ContextModule } from './context/context.module';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { LearnerModule } from './learner/learner.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RagModule } from './rag/rag.module';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from './session/session.module';
import { SourcesModule } from './sources/sources.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    OnboardingModule,
    LearnerModule,
    AiModule,
    ConceptRegistryModule,
    QueueModule,
    RagModule,
    SourcesModule,
    ContextModule,
    RedisModule,
    SubscriptionModule,
    SessionModule,
    HealthModule,
  ],
})
export class AppModule {}
