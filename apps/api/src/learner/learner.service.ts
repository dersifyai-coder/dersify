import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnerGoal, Prisma, Profile } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

@Injectable()
export class LearnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(learnerId: string): Promise<ApiResponse<Profile>> {
    try {
      const profile = await this.prisma.profile.findUniqueOrThrow({
        where: { id: learnerId },
      });

      return this.ok('Profile loaded.', profile);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Profile not found.');
      }

      throw error;
    }
  }

  async updateProfile(
    learnerId: string,
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<Profile>> {
    try {
      const profile = await this.prisma.profile.update({
        where: { id: learnerId },
        data: { fullName: dto.fullName },
      });

      return this.ok('Profile updated.', profile);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Profile not found.');
      }

      throw error;
    }
  }

  async getGoals(learnerId: string): Promise<ApiResponse<LearnerGoal[]>> {
    const goals = await this.prisma.learnerGoal.findMany({
      where: { learnerId },
      orderBy: { priority: 'asc' },
    });

    return this.ok('Goals loaded.', goals);
  }

  async createGoal(
    learnerId: string,
    dto: CreateGoalDto,
  ): Promise<ApiResponse<LearnerGoal>> {
    const goal = await this.prisma.learnerGoal.create({
      data: {
        learnerId,
        subject: dto.subject,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        priority: dto.priority ?? 1,
      },
    });

    return this.ok('Goal created.', goal);
  }

  async updateGoal(
    learnerId: string,
    goalId: string,
    dto: UpdateGoalDto,
  ): Promise<ApiResponse<LearnerGoal>> {
    try {
      const goal = await this.prisma.learnerGoal.update({
        where: { id: goalId, learnerId },
        data: {
          ...(dto.subject !== undefined && { subject: dto.subject }),
          ...(dto.targetDate !== undefined && {
            targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
          }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
        },
      });

      return this.ok('Goal updated.', goal);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Goal not found.');
      }

      throw error;
    }
  }

  async deleteGoal(
    learnerId: string,
    goalId: string,
  ): Promise<ApiResponse<null>> {
    try {
      await this.prisma.learnerGoal.delete({
        where: { id: goalId, learnerId },
      });

      return this.ok('Goal deleted.', null);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Goal not found.');
      }

      throw error;
    }
  }

  private ok<T>(message: string, data: T): ApiResponse<T> {
    return { success: true, message, data };
  }
}
