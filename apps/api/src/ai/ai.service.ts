import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AiService {
  async embed(_text: string): Promise<number[]> {
    throw new NotImplementedException('AiService.embed() is implemented in F-04.');
  }
}
