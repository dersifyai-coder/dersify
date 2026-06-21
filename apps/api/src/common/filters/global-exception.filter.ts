import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@dersify/database';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as Record<string, unknown>).message as string ?? message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // instanceof guards runtime; explicit cast needed because tsc doesn't narrow 'unknown' via instanceof with Prisma types
      const e = exception as Prisma.PrismaClientKnownRequestError;
      if (e.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists.';
      } else if (e.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found.';
      }
    }

    this.logger.error(
      `${request.method} ${request.url} → ${status}: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
