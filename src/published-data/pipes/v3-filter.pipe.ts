import { FilterPipe } from "src/common/pipes/filter.pipe";
import { JsonToStringPipe } from "src/jobs/pipes/v3-filter.pipe";
import { PublishedData } from "../schemas/published-data.schema";
import { publishedDataV3toV4FieldMap } from "../dto/published-data.obsolete.dto";

export const V3_FILTER_TO_V4_PIPE = [
  new FilterPipe<PublishedData>({ apiToDBMap: publishedDataV3toV4FieldMap }),
  new JsonToStringPipe("fields"),
];
