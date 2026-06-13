import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { LearnerModule } from '../learner/learner.module';
import { RagModule } from '../rag/rag.module';
import { ContextBudgetManager } from './context-budget.manager';
import { ContextService } from './context.service';
import { SignalDetectorService } from './signal-detector.service';

@Module({
  imports: [AiModule, LearnerModule, RagModule],
  providers: [ContextService, ContextBudgetManager, SignalDetectorService],
  exports: [ContextService, SignalDetectorService, ContextBudgetManager],
})
export class ContextModule {}
