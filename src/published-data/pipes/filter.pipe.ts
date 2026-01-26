import { FilterPipe } from "src/common/pipes/filter.pipe";
import { PublishedData } from "../schemas/published-data.schema";
import { publishedDataV3toV4FieldMap } from "../dto/published-data.obsolete.dto";
import { JsonToStringPipe } from "src/common/pipes/json-to-string.pipe";

export const V3_FILTER_PIPE = [
  new FilterPipe<PublishedData>({ apiToDBMap: publishedDataV3toV4FieldMap }),
];

export const V4_FILTER_PIPE = [
  new FilterPipe<PublishedData>({ allowObjectFields: false }),
  new JsonToStringPipe("fields"),
  new JsonToStringPipe("limits"),
];
