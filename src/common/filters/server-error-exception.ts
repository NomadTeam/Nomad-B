import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class InternalServerError implements ExceptionFilter {
  private readonly logger = new Logger('Server Error');
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.log(exception);

    response.status(status).json({
      err: '서버 오류입니다. 잠시 후 다시 이용해주세요.',
      data: null,
    });
  }
}
