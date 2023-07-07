import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageDto } from 'src/share/dto/response-page.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PageDto),
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Successfully received model list',
      schema: {
        allOf: [
          {
            properties: {
              message: {
                type: 'string',
              },
              code: {
                type: 'number',
              },
              data: {
                type: 'object',
                allOf: [
                  { $ref: getSchemaPath(PageDto) },
                  {
                    properties: {
                      datas: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
};
