import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async completeOnboarding(learnerId: string, dto: CompleteOnboardingDto): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Prisma transaction client type from @dersify/database resolves to a different @prisma/client
        // than the generated root client; cast via typeof this.prisma is safe at runtime.
        const db = tx as unknown as typeof this.prisma;

        const profile = await db.profile.findUnique({
          where: { id: learnerId },
          select: { onboardingCompleted: true },
        });

        if (!profile) {
          throw new NotFoundException('Learner profile not found.');
        }

        if (profile.onboardingCompleted) {
          throw new ConflictException('Onboarding already completed.');
        }

        await db.profile.update({
          where: { id: learnerId },
          data: {
            motivation:        dto.motivation,
            learningApproach:  dto.learning_approach,
            struggleResponse:  dto.struggle_response,
            hoursPerWeek:      dto.hours_per_week,
            learningPace:      dto.learning_pace,
            onboardingCompleted: true,
          },
        });

        await db.notificationPreference.upsert({
          where:  { learnerId },
          create: { learnerId },
          update: {},
        });
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // instanceof guards runtime; explicit cast needed because tsc doesn't narrow 'unknown' via instanceof with Prisma types
        const e = error as Prisma.PrismaClientKnownRequestError;
        if (e.code === 'P2002') {
          throw new ConflictException('Onboarding already completed.');
        }
        if (e.code === 'P2025') {
          throw new NotFoundException('Learner profile not found.');
        }
      }

      throw error;
    }

    await this.invalidateLayer1Cache(learnerId);
    this.logger.log(`onboarding_completed learnerId=${learnerId}`);
  }

  // Cache invalidation for dersify:context:layer1:{learnerId}:* is wired in F-04
  // when @nestjs/cache-manager + ioredis are configured in CacheModule.
  private async invalidateLayer1Cache(learnerId: string): Promise<void> {
    this.logger.debug(`layer1_cache_invalidation_pending learnerId=${learnerId}`);
  }
}
