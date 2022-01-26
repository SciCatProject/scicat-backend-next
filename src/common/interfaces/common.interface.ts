import { ScientificRelation } from "../scientific-relation.enum";

export interface IScientificFilter {
  lhs: string;
  relation: ScientificRelation;
  rhs: string | number;
  unit: string | undefined;
}
