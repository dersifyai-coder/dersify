import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ConceptRegistryService } from './concept-registry.service';

@Module({
  imports: [AiModule],
  providers: [ConceptRegistryService],
  exports: [ConceptRegistryService],
})
export class ConceptRegistryModule {}
