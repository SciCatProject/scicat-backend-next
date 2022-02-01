import { FilterQuery } from "mongoose";
import { ProposalDocument } from "../schemas/proposal.schema";

export enum ProposalField {
  Text = "text",
  StartTime = "startTime",
  EndTime = "endTime",
  ProposalId = "proposalId",
  Title = "title",
  Firstname = "firstName",
  Lastname = "lastName",
}

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
}

export interface IProposalFilters {
  where?: FilterQuery<ProposalDocument>;
  include?: { relation: string }[];
  fields?: IProposalFields;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}

export interface IProposalFacets {
  fields?: IProposalFields;
  facets?: string[];
}
