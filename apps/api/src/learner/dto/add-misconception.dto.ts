import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum MisconceptionType {
  Terminology = 'terminology',
  Overgeneralization = 'overgeneralization',
  Underapplication = 'underapplication',
  CausalInversion = 'causal_inversion',
  FalseAnalogy = 'false_analogy',
  Structural = 'structural',
}

export enum MisconceptionSeverity {
  Surface = 'surface',
  Deep = 'deep',
}

export class AddMisconceptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  conceptId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: MisconceptionType })
  @IsEnum(MisconceptionType)
  misconceptionType!: MisconceptionType;

  @ApiProperty({ enum: MisconceptionSeverity, required: false })
  @IsOptional()
  @IsEnum(MisconceptionSeverity)
  severity?: MisconceptionSeverity;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  learnerStatement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aiCorrection?: string;
}
