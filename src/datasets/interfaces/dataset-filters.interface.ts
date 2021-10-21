import { ScientificRelation } from 'src/common/scientific-relation.enum';

export interface IScientificFilter {
  lhs: string;
  relation: ScientificRelation;
  rhs: string | number;
  unit: string | undefined;
}

export interface IDatasetFilters {
  query?: {
    mode?: Record<string, any>;
    text?: string;
    creationTime?: {
      begin: string;
      end: string;
    };
    type?: string[];
    creationLocation?: string[];
    ownerGroup?: string[];
    keywords?: string[];
    scientific?: IScientificFilter[];
  };
  limits: {
    skip: number;
    limit: number;
    order: string;
  };
}
