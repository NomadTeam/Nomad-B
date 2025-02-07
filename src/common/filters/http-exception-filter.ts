import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpException.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (status === 500) {
      this.logger.log(error);

      response.status(500).json({
        err: '서버 오류입니다. 잠시 후 다시 이용해주세요.',
        data: null,
      });
    }

    if (typeof error === 'string') {
      response.status(status).json({
        err: error,
        data: null,
      });
    }

    if (typeof error === 'object') {
      if (typeof error.message === 'string') {
        response.status(status).json({
          err: error.message,
          data: null,
        });
      } else {
        response.status(status).json({
          err: error.message[0],
          data: null,
        });
      }
    }
  }
}
