import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  error: string;
  message: string | string[];
  statusCode: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpException.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as ErrorResponse;

    if (status === 500) this.logger.error(error);

    if (typeof error.message === 'string') {
      response.status(status).json({
        err: error.error,
        data: error.message,
      });
    } else {
      response.status(status).json({
        err: error.error,
        data: error.message[0],
      });
    }
  }
}
