import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Đã xảy ra lỗi máy chủ';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.normalizeHttpMessage(
        exception.getResponse() as string | Record<string, unknown>,
      );
    } else {
      const err =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(err.stack ?? err.message);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeHttpMessage(
    body: string | Record<string, unknown>,
  ): string | string[] {
    if (typeof body === 'string') {
      return body;
    }
    const msg = body['message'];
    if (typeof msg === 'string') {
      return msg;
    }
    if (Array.isArray(msg) && msg.every((m) => typeof m === 'string')) {
      return msg as string[];
    }
    return 'Lỗi không xác định';
  }
}
