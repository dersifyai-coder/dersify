import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { SessionModule } from './session/session.module';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
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
    SessionModule,
    HealthModule,
  ],
})
export class AppModule {}
