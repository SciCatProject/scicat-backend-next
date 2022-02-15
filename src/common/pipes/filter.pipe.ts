
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilterPipe implements PipeTransform<
        {filter?: string, fields?: string}, 
        {filter?: string, fields?: string}> {

    transform(inValue: {filter?: string, fields?: string}, metadata: ArgumentMetadata): {filter?: string, fields?: string} {
        /*
         * intercept filter and make sure to convert loopback operators to mongo operators
         */
        console.log("Filter pipe ---------");
        console.log(inValue);
        const outValue = inValue;
        if (inValue.filter) {
            var filter = inValue.filter;
            // subsitute the loopback operators to mongo equivalent
            // nin => $in
            filter = filter.replace(/{"inq":/g,'{"$in":');
            // nin => $nin
            filter = filter.replace(/{"nin":/g,'{"$nin":');
            // and => $and
            filter = filter.replace(/{"and":\[/g,'{"$and":[');
            // and => $or
            filter = filter.replace(/{"or":\[/g,'{"$or":[');
            outValue.filter = filter;
        } 
        console.log("Output :" + JSON.stringify(outValue));
        return outValue;
    }
}
