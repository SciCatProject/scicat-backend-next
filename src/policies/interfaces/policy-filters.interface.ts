import { FilterQuery } from "mongoose";
import { PolicyDocument } from "../schemas/policy.schema";

export interface IPolicyFilter {
  where?: FilterQuery<PolicyDocument>;
  order?: string;
  skip?: number;
  limit?: number;
}
