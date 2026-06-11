import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompleteOnboardingDto,
  HoursPerWeek,
  LearningApproach,
  LearningPace,
  Motivation,
  StruggleResponse,
} from './dto/complete-onboarding.dto';
import { OnboardingService } from './onboarding.service';

const LEARNER_ID = '00000000-0000-0000-0000-000000000001';

const validDto: CompleteOnboardingDto = {
  motivation:        Motivation.BuildProject,
  learning_approach: LearningApproach.ExampleFirst,
  struggle_response: StruggleResponse.Hints,
  hours_per_week:    HoursPerWeek.ThreeToFive,
  learning_pace:     LearningPace.Steady,
};

describe('OnboardingService', () => {
  let service: OnboardingService;
  let mockTx: {
    profile: { findUnique: jest.Mock; update: jest.Mock };
    notificationPreference: { upsert: jest.Mock };
  };
  let mockPrisma: {
    profile: { findUnique: jest.Mock; update: jest.Mock };
    notificationPreference: { upsert: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    mockTx = {
      profile: {
        findUnique: jest.fn(),
        update:     jest.fn(),
      },
      notificationPreference: {
        upsert: jest.fn(),
      },
    };

    mockPrisma = {
      ...mockTx,
      $transaction: jest
        .fn()
        .mockImplementation(
          async (
            cb: (tx: typeof mockTx) => Promise<void>,
          ) => cb(mockTx),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  describe('completeOnboarding', () => {
    beforeEach(() => {
      mockTx.profile.findUnique.mockResolvedValue({ onboardingCompleted: false });
      mockTx.profile.update.mockResolvedValue({});
      mockTx.notificationPreference.upsert.mockResolvedValue({});
    });

    it('saves all 5 behavioral fields to the profile', async () => {
      await service.completeOnboarding(LEARNER_ID, validDto);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            motivation:       validDto.motivation,
            learningApproach: validDto.learning_approach,
            struggleResponse: validDto.struggle_response,
            hoursPerWeek:     validDto.hours_per_week,
            learningPace:     validDto.learning_pace,
          }),
        }),
      );
    });

    it('sets onboarding_completed = true', async () => {
      await service.completeOnboarding(LEARNER_ID, validDto);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ onboardingCompleted: true }),
        }),
      );
    });

    it('upserts NotificationPreference with learnerId', async () => {
      await service.completeOnboarding(LEARNER_ID, validDto);

      expect(mockTx.notificationPreference.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { learnerId: LEARNER_ID } }),
      );
    });

    it('throws ConflictException if already completed', async () => {
      mockTx.profile.findUnique.mockResolvedValue({ onboardingCompleted: true });

      await expect(
        service.completeOnboarding(LEARNER_ID, validDto),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException if profile not found', async () => {
      mockTx.profile.findUnique.mockResolvedValue(null);

      await expect(
        service.completeOnboarding(LEARNER_ID, validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('calls invalidateLayer1Cache with learnerId on success', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spy = jest.spyOn(service as any, 'invalidateLayer1Cache');

      await service.completeOnboarding(LEARNER_ID, validDto);

      expect(spy).toHaveBeenCalledWith(LEARNER_ID);
    });
  });
});
