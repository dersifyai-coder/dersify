import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class SessionService {
  startSession(): never {
    throw new NotImplementedException('SessionService.startSession is not yet implemented');
  }

  endSession(): never {
    throw new NotImplementedException('SessionService.endSession is not yet implemented');
  }

  recordAnswer(): never {
    throw new NotImplementedException('SessionService.recordAnswer is not yet implemented');
  }
}
