import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import ResponseMsgError from 'src/share/dto/response-msg-err.dto';

export const ApiModelResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray?: boolean,
) => {
  return applyDecorators(
    ApiHeader({
      name: 'Authorization',
      example: 'Bearer 1ZXwyA5riU6Yeukedmz8l49SbR3JmfTa53HqFLNlZpYs',
      required: true,
    }),
    ApiExtraModels(model),
    ApiExtraModels(ResponseMsgError),
    ApiOkResponse({
      description: 'Successfully',
      schema: isArray
        ? {
            allOf: [
              {
                properties: {
                  message: {
                    type: 'string',
                  },
                  statusCode: {
                    type: 'number',
                  },
                  payload: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
              },
            ],
            example: {
              transaction_id: '87f5d649-b8c8-467f-a94a-55eb40d59c67',
              message: 'success',
              statusCode: 200,
              payload: [],
            },
          }
        : {
            allOf: [
              {
                properties: {
                  transaction_id: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                  statusCode: {
                    type: 'number',
                  },
                  payload: { $ref: getSchemaPath(model) },
                },
              },
            ],
            example: {
              transaction_id: '87f5d649-b8c8-467f-a94a-55eb40d59c67',
              message: 'success',
              statusCode: 200,
              payload: {},
            },
          },
    }),
    ApiBadRequestResponse({
      description: 'Validate Error',
      type: ResponseMsgError,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      type: ResponseMsgError,
    }),
  );
};
