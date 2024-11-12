import { ApiProperty } from "@nestjs/swagger";
import { FilterQuery } from "mongoose";
import { PublishedDataDocument } from "../schemas/published-data.schema";

export interface IPublishedDataFilters {
  where?: FilterQuery<PublishedDataDocument>;
  include?: { relation: string }[];
  fields?: {
    status: string;
  };
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}

export class ICount {
  @ApiProperty()
  count: number;
}

export class FormPopulateData {
  @ApiProperty({
    type: String,
  })
  resourceType?: string;

  @ApiProperty({
    type: String,
  })
  description?: string;

  @ApiProperty({
    type: String,
  })
  title?: string;

  @ApiProperty({
    type: String,
  })
  abstract?: string;

  @ApiProperty({
    type: String,
  })
  thumbnail?: string;
}

export interface IRegister {
  doi: string;
}
