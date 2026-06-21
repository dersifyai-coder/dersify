import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ConfigModule, QueueModule],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
