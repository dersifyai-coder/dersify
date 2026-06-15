import { IsEnum, IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type PriorKnowledgeSignal = 'none' | 'beginner' | 'intermediate' | 'advanced';

export class StartSessionDto {
  @ApiProperty({ description: 'Topic the learner wants to study' })
  @IsString()
  @MinLength(1)
  topic!: string;

  @ApiProperty({ enum: ['none', 'beginner', 'intermediate', 'advanced'] })
  @IsEnum(['none', 'beginner', 'intermediate', 'advanced'])
  prior_knowledge_signal!: PriorKnowledgeSignal;

  @ApiProperty({ minimum: 5, maximum: 240, description: 'Minutes available for this session' })
  @IsInt()
  @Min(5)
  @Max(240)
  time_available_minutes!: number;
}
