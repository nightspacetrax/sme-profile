import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AxiosError } from 'axios';
import ResponseMsgError from 'src/share/dto/response-msg-err.dto';

@Catch()
export class HandleException implements ExceptionFilter {
  constructor() {}
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    Logger.error(exception, HandleException.name);
    Logger.error(request.url, HandleException.name);
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let err: ResponseMsgError;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorException = JSON.parse(
        JSON.stringify(exception.getResponse()),
      );

      err = new ResponseMsgError(
        status,
        errorException.error,
        errorException.message || exception.message || exception.getResponse(),
      );
    } else if (exception instanceof AxiosError) {
      status = exception.response.status;
      err = new ResponseMsgError(
        status,
        exception.response.statusText,
        exception.response.data,
      );
    } else if (exception.message.includes('HTTP-Code')) {
      const errStr = JSON.stringify(exception);
      const data = JSON.parse(errStr);
      status = data.code;
      err = new ResponseMsgError(data.code, data.body.category, data.body);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      err = new ResponseMsgError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'error',
        'INTERNAL_SERVER_ERROR',
      );
    }

    response.status(status).send(err);
  }
}
