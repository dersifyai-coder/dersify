import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;
}
