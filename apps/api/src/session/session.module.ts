import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ContextModule } from '../context/context.module';
import { LearnerModule } from '../learner/learner.module';
import { QueueModule } from '../queue/queue.module';
import { RedisModule } from '../redis/redis.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [
    AiModule,
    ContextModule,
    LearnerModule,
    QueueModule,
    RedisModule,
    SubscriptionModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
