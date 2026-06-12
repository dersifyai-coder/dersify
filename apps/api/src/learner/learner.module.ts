import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LearnerController } from './learner.controller';
import { LearnerService } from './learner.service';

@Module({
  imports: [AuthModule],
  controllers: [LearnerController],
  providers: [LearnerService],
  exports: [LearnerService],
})
export class LearnerModule {}
