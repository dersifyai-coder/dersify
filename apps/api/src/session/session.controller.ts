import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SupabaseJwtPayload } from '../auth/strategies/jwt.strategy';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('session')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiOperation({ summary: 'Start or resume a learning session' })
  @ApiResponse({ status: 201, description: 'Session started' })
  @Post()
  startSession(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: StartSessionDto,
  ) {
    return this.sessionService.startSession(user.sub, dto);
  }

  @ApiOperation({ summary: 'Send a message in the session' })
  @ApiResponse({ status: 200, description: 'AI response' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post(':id/message')
  @HttpCode(HttpStatus.OK)
  sendMessage(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sessionService.sendMessage(user.sub, sessionId, dto);
  }

  @ApiOperation({ summary: 'End a session' })
  @ApiResponse({ status: 200, description: 'Session ended' })
  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  endSession(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionService.endSession(user.sub, sessionId);
  }

  @ApiOperation({ summary: 'Get all messages for a session' })
  @ApiResponse({ status: 200 })
  @Get(':id/messages')
  getSessionHistory(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    return this.sessionService.getSessionHistory(user.sub, sessionId);
  }

  @ApiOperation({ summary: 'Get the current active (unended) session' })
  @ApiResponse({ status: 200 })
  @Get('active')
  getActiveSession(@CurrentUser() user: SupabaseJwtPayload) {
    return this.sessionService.getActiveSession(user.sub);
  }
}
