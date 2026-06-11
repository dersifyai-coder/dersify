import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SupabaseJwtPayload } from '../auth/strategies/jwt.strategy';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @ApiOperation({ summary: 'Complete learner onboarding (SYSTEM 1)' })
  @ApiResponse({ status: 201, description: 'Onboarding completed.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @ApiResponse({ status: 409, description: 'Onboarding already completed.' })
  @UseGuards(JwtAuthGuard)
  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  async completeOnboarding(
    @CurrentUser() user: SupabaseJwtPayload,
    @Body() dto: CompleteOnboardingDto,
  ): Promise<{ success: true; message: string }> {
    await this.onboardingService.completeOnboarding(user.sub, dto);

    return { success: true, message: 'Onboarding completed.' };
  }
}
