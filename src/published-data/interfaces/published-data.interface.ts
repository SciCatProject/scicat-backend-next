import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
  @ApiPropertyOptional()
  resourceType?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  abstract?: string;

  @ApiPropertyOptional()
  thumbnail?: string;
}

export interface IRegister {
  doi: string;
}
