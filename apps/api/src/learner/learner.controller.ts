import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { LearnerService, TopicKnowledgeSummary } from './learner.service';

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
}
