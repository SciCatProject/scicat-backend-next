import { PipeTransform, Injectable } from "@nestjs/common";

@Injectable()
export class FilterPipe
  implements
    PipeTransform<
      { filter?: string; fields?: string },
      { filter?: string; fields?: string }
    >
{
  transform(inValue: { filter?: string; fields?: string }): {
    filter?: string;
    fields?: string;
  } {
    /*
     * intercept filter and make sure to convert loopback operators to mongo operators
     */
    const outValue = inValue;
    if (inValue.filter) {
      let filter = inValue.filter;
      // subsitute the loopback operators to mongo equivalent
      // nin => $in

      filter = filter.replace(/{"inq":/g, '{"$in":');
      // nin => $nin

      filter = filter.replace(/{"nin":/g, '{"$nin":');
      // and => $and

      filter = filter.replace(/{"and":\[/g, '{"$and":[');
      // and => $or

      filter = filter.replace(/{"or":\[/g, '{"$or":[');
      outValue.filter = filter;
    }
    return outValue;
  }
}
