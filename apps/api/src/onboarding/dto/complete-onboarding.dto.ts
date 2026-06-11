import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum Motivation {
  LearnSkill    = 'learn-skill',
  CareerAdvance = 'career-advance',
  ExamPrep      = 'exam-prep',
  BuildProject  = 'build-project',
  Academic      = 'academic',
  Curiosity     = 'curiosity',
}

export enum LearningApproach {
  Structured   = 'structured',
  Exploratory  = 'exploratory',
  ExampleFirst = 'example-first',
  TheoryFirst  = 'theory-first',
}

export enum StruggleResponse {
  Persist            = 'persist',
  Hints              = 'hints',
  ExplainDifferently = 'explain-differently',
  TakeBreak          = 'take-break',
}

export enum HoursPerWeek {
  LessThanOne = 'lt1',
  OneToThree  = '1-3',
  ThreeToFive = '3-5',
  FiveToTen   = '5-10',
  MoreThanTen = 'gt10',
}

export enum LearningPace {
  SlowDeep = 'slow-deep',
  Steady   = 'steady',
  Fast     = 'fast',
  Flexible = 'flexible',
}

export class CompleteOnboardingDto {
  @ApiProperty({ enum: Motivation })
  @IsEnum(Motivation)
  motivation!: Motivation;

  @ApiProperty({ enum: LearningApproach })
  @IsEnum(LearningApproach)
  learning_approach!: LearningApproach;

  @ApiProperty({ enum: StruggleResponse })
  @IsEnum(StruggleResponse)
  struggle_response!: StruggleResponse;

  @ApiProperty({ enum: HoursPerWeek })
  @IsEnum(HoursPerWeek)
  hours_per_week!: HoursPerWeek;

  @ApiProperty({ enum: LearningPace })
  @IsEnum(LearningPace)
  learning_pace!: LearningPace;
}
