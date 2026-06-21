import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, Length, Matches } from 'class-validator';

export class AddPdfSourceDto {
  @ApiProperty({ example: 'machine-learning' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({ example: 'Deep Learning Textbook Ch. 3' })
  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class AddUrlSourceDto {
  @ApiProperty({ example: 'machine-learning' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({ example: 'Attention Is All You Need' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'https://arxiv.org/abs/1706.03762' })
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url!: string;
}

export class AddYouTubeSourceDto {
  @ApiProperty({ example: 'machine-learning' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({ example: '3Blue1Brown: Neural Networks' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'aircAruvnKk', description: '11-character YouTube video ID' })
  @IsString()
  @Length(11, 11, { message: 'youtubeId must be exactly 11 characters' })
  @Matches(/^[a-zA-Z0-9_-]{11}$/, { message: 'Invalid YouTube video ID format' })
  youtubeId!: string;
}
