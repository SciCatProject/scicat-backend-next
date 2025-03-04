interface IDateRange {
  begin: string;
  end: string;
}

interface IJobFieldObject {
  $regex: string;
  $options: string;
}

interface IJobIdsFieldObject {
  $in: string[];
}

export interface IJobFields {
  mode?: Record<string, unknown>;
  text?: string;
  createdAt?: IDateRange;
  id?: IJobFieldObject;
  _id?: IJobIdsFieldObject;
  type?: IJobFieldObject;
  statusCode?: IJobFieldObject;
  jobParams?: IJobFieldObject;
  jobResultObject?: IJobFieldObject;
  ownerUser?: IJobFieldObject;
  ownerGroup?: string[];
  accessGroups?: string[];
}
