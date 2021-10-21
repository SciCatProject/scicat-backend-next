import { ScientificRelation } from 'src/common/scientific-relation.enum';

interface IScientificQuery {
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
    scientific?: IScientificQuery[];
  };
  limits: {
    skip: number;
    limit: number;
    order: string;
  };
}
