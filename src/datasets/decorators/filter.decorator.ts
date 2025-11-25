import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

export const Filter = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request?.headers?.[data];
    const header = request?.query?.[data];
    if (query && header)
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
      if (query) filter = JSON.parse(query);
      if (header) filter = JSON.parse(header);
    } catch (err) {
      const error = err as Error;
      throw new BadRequestException(`Invalid JSON in filter: ${error.message}`);
    }
    if (data) return JSON.stringify(filter);
    return { filter: JSON.stringify(filter) };
  },
);
