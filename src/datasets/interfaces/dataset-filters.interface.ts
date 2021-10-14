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
    scientific?: string[];
  };
  limits: {
    skip: number;
    limit: number;
    order: string;
  };
}
