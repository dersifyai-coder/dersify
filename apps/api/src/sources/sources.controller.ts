import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SupabaseJwtPayload } from '../auth/strategies/jwt.strategy';
import { SourcesService } from './sources.service';
import { AddPdfSourceDto, AddUrlSourceDto, AddYouTubeSourceDto } from './dto/add-source.dto';

// TODO P-11: add @UseGuards(SubscriptionGuard) with @RequireTier('pro') once SubscriptionGuard is built
@ApiTags('sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @ApiOperation({ summary: 'Upload a PDF source' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 202, description: 'Source queued for processing' })
  @Post('pdf')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  addPdf(
    @CurrentUser() user: SupabaseJwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AddPdfSourceDto,
  ): Promise<{ id: string; status: string }> {
    return this.sourcesService.addPdfSource(user.sub, file, dto);
  }

  @ApiOperation({ summary: 'Add a URL source' })
  @ApiResponse({ status: 202, description: 'Source queued for processing' })
  @Post('url')
  @HttpCode(HttpStatus.ACCEPTED)
  addUrl(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: AddUrlSourceDto,
  ): Promise<{ id: string; status: string }> {
    return this.sourcesService.addUrlSource(user.sub, dto);
  }

  @ApiOperation({ summary: 'Add a YouTube source' })
  @ApiResponse({ status: 202, description: 'Source queued for processing' })
  @Post('youtube')
  @HttpCode(HttpStatus.ACCEPTED)
  addYouTube(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: AddYouTubeSourceDto,
  ): Promise<{ id: string; status: string }> {
    return this.sourcesService.addYouTubeSource(user.sub, dto);
  }

  @ApiOperation({ summary: 'List sources for the authenticated learner' })
  @ApiQuery({ name: 'topic', required: false })
  @ApiResponse({ status: 200 })
  @Get()
  getSources(
    @CurrentUser() user: SupabaseJwtPayload,
    @Query('topic') topic?: string,
  ) {
    return this.sourcesService.getSources(user.sub, topic);
  }

  @ApiOperation({ summary: 'Delete a source and all its chunks' })
  @ApiResponse({ status: 204 })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSource(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.sourcesService.deleteSource(user.sub, id);
  }
}
