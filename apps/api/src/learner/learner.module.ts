import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { LearnerController } from './learner.controller';
import { LearnerService } from './learner.service';
import { MisconceptionService } from './misconception.service';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [LearnerController],
  providers: [LearnerService, MisconceptionService],
  exports: [LearnerService],
})
export class LearnerModule {}
