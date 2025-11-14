import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

export const Filter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request?.headers?.filter && request?.query?.filter)
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message:
            "Using two different types(query and headers) of filters is not supported and can result with inconsistencies",
        },
        HttpStatus.BAD_REQUEST,
      );
    let filter = {};
    try {
      if (request?.query?.filter) filter = JSON.parse(request.query.filter);
      if (request?.headers?.filter) filter = JSON.parse(request.headers.filter);
    } catch (err) {
      const error = err as Error;
      throw new BadRequestException(`Invalid JSON in filter: ${error.message}`);
    }
    return { filter: JSON.stringify(filter) };
  },
);
