import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  async checkSessionAllowed(
    _learnerId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  async checkExchangeAllowed(
    _learnerId: string,
    _sessionId: string,
  ): Promise<{ allowed: boolean }> {
    return { allowed: true };
  }

  async getTier(_learnerId: string): Promise<'free' | 'pro' | 'teams'> {
    return 'free';
  }
}
