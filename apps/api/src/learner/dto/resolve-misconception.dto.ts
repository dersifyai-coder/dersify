import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ResolveMisconceptionDto {
  @ApiProperty({ required: false, description: 'Session ID where misconception was resolved' })
  @IsOptional()
  @IsString()
  @IsUUID()
  sessionId?: string;
}
