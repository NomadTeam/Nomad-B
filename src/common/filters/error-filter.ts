import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('Server Error');
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) return;

    this.logger.log(exception);

    response.status(status).json({
      err: '서버 오류입니다. 잠시 후 다시 이용해주세요.',
      data: null,
    });
  }
}
