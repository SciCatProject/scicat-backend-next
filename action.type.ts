import { Attachment } from "nodemailer/lib/mailer";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { Instrument } from "src/instruments/schemas/instrument.schema";
import { JobClass } from "src/jobs/schemas/job.schema";
import { ProposalClass } from "src/proposals/schemas/proposal.schema";
import { SampleClass } from "src/samples/schemas/sample.schema";
import { User } from "src/users/schemas/user.schema";

export type ROLES =
  | "authenticated_user"
  | "admin"
  | "delete_group"
  | "create_dataset";

export type ACTION = "manage" | "create" | "read" | "update" | "delete";

export const SUBJECTS = {
  Dataset: DatasetClass,
  DatasetAttachment: DatasetClass,
  Proposal: ProposalClass,
  ProposalAttachment: ProposalClass,
  All: "all",
} as const;
