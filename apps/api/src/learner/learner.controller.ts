import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LearnerKnowledgeState, Profile } from '@dersify/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SupabaseJwtPayload } from '../auth/strategies/jwt.strategy';
import { LearnerService, MisconceptionWithConcept, TopicKnowledgeSummary } from './learner.service';
import { ResolveMisconceptionDto } from './dto/resolve-misconception.dto';

@ApiTags('learner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learner')
export class LearnerController {
  constructor(private readonly learnerService: LearnerService) {}

  @ApiOperation({ summary: 'Get authenticated learner profile' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  @Get('me')
  getProfile(@CurrentUser() user: SupabaseJwtPayload): Promise<Profile> {
    return this.learnerService.getProfile(user.sub);
  }

  @ApiOperation({ summary: 'Get knowledge summary for a topic (Layer 1 context)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @Get('knowledge/:topic')
  getTopicKnowledgeSummary(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('topic') topic: string,
  ): Promise<TopicKnowledgeSummary> {
    return this.learnerService.getTopicKnowledgeSummary(user.sub, topic);
  }

  @ApiOperation({ summary: 'Get concepts due for review within 3 days' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @Get('due/:topic')
  getDueConcepts(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('topic') topic: string,
  ): Promise<LearnerKnowledgeState[]> {
    return this.learnerService.getDueConceptsForTopic(user.sub, topic);
  }

  @ApiOperation({ summary: 'Get active misconceptions for a topic' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @Get('misconceptions/:topic')
  getActiveMisconceptions(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('topic') topic: string,
  ): Promise<MisconceptionWithConcept[]> {
    return this.learnerService.getActiveMisconceptions(user.sub, topic);
  }

  @ApiOperation({ summary: 'Mark a misconception as resolved' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  @HttpCode(200)
  @Post('misconceptions/:id/resolve')
  resolveMisconception(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('id') id: string,
    @Body() dto: ResolveMisconceptionDto,
  ): Promise<void> {
    return this.learnerService.resolveMisconception(user.sub, id, dto.sessionId);
  }
}
