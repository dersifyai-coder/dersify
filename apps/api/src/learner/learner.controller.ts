import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LearnerGoal, Profile } from '@dersify/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SupabaseJwtPayload } from '../auth/strategies/jwt.strategy';
import { LearnerService } from './learner.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('learner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learner')
export class LearnerController {
  constructor(private readonly learnerService: LearnerService) {}

  @ApiOperation({ summary: 'Get learner profile' })
  @ApiResponse({ status: 200, description: 'Profile loaded.' })
  @Get('profile')
  getProfile(
    @CurrentUser() user: SupabaseJwtPayload,
  ): Promise<{ success: true; message: string; data: Profile }> {
    return this.learnerService.getProfile(user.sub);
  }

  @ApiOperation({ summary: 'Update learner profile' })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ success: true; message: string; data: Profile }> {
    return this.learnerService.updateProfile(user.sub, dto);
  }

  @ApiOperation({ summary: 'Get all learner goals' })
  @ApiResponse({ status: 200, description: 'Goals loaded.' })
  @Get('goals')
  getGoals(
    @CurrentUser() user: SupabaseJwtPayload,
  ): Promise<{ success: true; message: string; data: LearnerGoal[] }> {
    return this.learnerService.getGoals(user.sub);
  }

  @ApiOperation({ summary: 'Create a new learner goal' })
  @ApiResponse({ status: 201, description: 'Goal created.' })
  @Post('goals')
  createGoal(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: CreateGoalDto,
  ): Promise<{ success: true; message: string; data: LearnerGoal }> {
    return this.learnerService.createGoal(user.sub, dto);
  }

  @ApiOperation({ summary: 'Update a learner goal' })
  @ApiResponse({ status: 200, description: 'Goal updated.' })
  @Patch('goals/:goalId')
  updateGoal(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('goalId') goalId: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<{ success: true; message: string; data: LearnerGoal }> {
    return this.learnerService.updateGoal(user.sub, goalId, dto);
  }

  @ApiOperation({ summary: 'Delete a learner goal' })
  @ApiResponse({ status: 200, description: 'Goal deleted.' })
  @Delete('goals/:goalId')
  deleteGoal(
    @CurrentUser() user: SupabaseJwtPayload,
    @Param('goalId') goalId: string,
  ): Promise<{ success: true; message: string; data: null }> {
    return this.learnerService.deleteGoal(user.sub, goalId);
  }
}
