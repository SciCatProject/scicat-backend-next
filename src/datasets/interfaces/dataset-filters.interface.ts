import { ScientificRelation } from "src/common/scientific-relation.enum";

export interface IScientificFilter {
  lhs: string;
  relation: ScientificRelation;
  rhs: string | number;
  unit: string | undefined;
}

interface IDatasetFields {
  mode?: Record<string, unknown>;
  text?: string;
  creationTime?: {
    begin: string;
    end: string;
  };
  type?: string[];
  creationLocation?: string[];
  ownerGroup?: string[];
  keywords?: string[];
  isPublished?: boolean;
  scientific?: IScientificFilter[];
  metadataKey?: string;
  _id?: string;
  userGroups?: string[];
  [key: string]: unknown;
}

export interface IDatasetFilters {
  fields?: IDatasetFields;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}

export interface IDatasetFacets {
  fields?: IDatasetFields;
  facets?: string[];
}
