interface IProposalFieldObject {
  $regex: string;
  $options: string;
}

interface IDateRange {
  begin: string;
  end: string;
}

export interface IProposalFields {
  text?: string;
  startTime?: IDateRange;
  proposalId?: IProposalFieldObject;
  title?: IProposalFieldObject;
  firstname?: IProposalFieldObject;
  lastname?: IProposalFieldObject;
  endTime?: IDateRange;
  ownerGroup?: string[];
  userGroups?: string[];
  isPublished?: boolean;
}
