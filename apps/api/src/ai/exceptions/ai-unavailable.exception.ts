import { InternalServerErrorException } from '@nestjs/common';

export class AiUnavailableException extends InternalServerErrorException {
  constructor(reason?: string) {
    super(`AI service unavailable: ${reason ?? 'Both providers failed'}`);
  }
}
