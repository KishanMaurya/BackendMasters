import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

class ResponseMetaDto {
  @ApiProperty()
  requestId: string;

  @ApiProperty()
  timestamp: string;
}

class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  pageSize: number;

  @ApiProperty({ example: 40 })
  total: number;
}

/** Documents a response in the `{ data, meta }` envelope the API actually returns. */
export function ApiOkEnvelope<T>(
  model: Type<T>,
  { isArray = false, paginated = false }: { isArray?: boolean; paginated?: boolean } = {},
) {
  const item = { $ref: getSchemaPath(model) };
  return applyDecorators(
    ApiExtraModels(model, ResponseMetaDto, PaginationDto),
    ApiOkResponse({
      schema: {
        required: ['data', 'meta'],
        properties: {
          data: isArray ? { type: 'array', items: item } : item,
          meta: {
            allOf: [
              { $ref: getSchemaPath(ResponseMetaDto) },
              ...(paginated
                ? [
                    {
                      required: ['pagination'],
                      properties: { pagination: { $ref: getSchemaPath(PaginationDto) } },
                    },
                  ]
                : []),
            ],
          },
        },
      },
    }),
  );
}
