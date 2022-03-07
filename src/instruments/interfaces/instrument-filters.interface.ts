import { FilterQuery } from "mongoose";
import { InstrumentDocument } from "../schemas/instrument.schema";

export interface IInstrumentFilters {
  where?: FilterQuery<InstrumentDocument>;
  include?: { relation: string }[];
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}
