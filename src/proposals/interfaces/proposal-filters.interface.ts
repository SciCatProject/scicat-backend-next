//import { ProposalClass, ProposalDocument } from "../schemas/proposal.schema";
//import { IFilters, ILimitsFilterDto } from "src/common/interfaces/common.interface";
//import { FilterQuery } from "mongoose";
//import { ApiProperty } from "@nestjs/swagger";
//import { string } from "mathjs";

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
};

/* export class IProposalFieldsDto implements IProposalFields {
  text?: string;
  startTime?: IDateRange;
  proposalId?: IProposalFieldObject;
  title?: IProposalFieldObject;
  firstname?: IProposalFieldObject;
  lastname?: IProposalFieldObject;
  endTime?: IDateRange;
}; */

//export class IProposalFilterDto implements IFilters<Proposal,IProposalFields> {
//  where?: FilterQuery<ProposalDocument>;
//  include?: { relation: string }[];
//  fields?: IProposalFieldsDto;
//  limits?: ILimitsFilterDto;
//};

/* export class IProposalFilterDto {
  @ApiProperty({
    type: Object,
    isArray: false,
    required: false,
    description: "Conditions on proposal fields",
  })
  where?: Record<string, object>[];
  included?: Record<string, object>[];
  fields?: Record<string, object>[];
  limits?: ILimitsFilterDto;
}; */
