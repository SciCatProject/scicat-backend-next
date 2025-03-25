import { JobActionOptions } from "../../jobconfig.interface";

export const actionType = "switch";

export enum SwitchScope {
  Request = "request",
  Datasets = "datasets",
}

export interface SwitchJobActionOptions extends JobActionOptions {
  actionType: typeof actionType;
  scope: SwitchScope;
  property: string;
  cases: CaseOptions[];
}

export type CaseOptions =
  | DefaultCaseOptions
  | SwitchCaseOptions
  | MatchCaseOptions
  | RegexCaseOptions;

export interface DefaultCaseOptions {
  actions: JobActionOptions[];
}
export interface SwitchCaseOptions extends DefaultCaseOptions {
  schema: object;
}
export interface MatchCaseOptions extends DefaultCaseOptions {
  match: string | number | boolean | null;
}
export interface RegexCaseOptions extends DefaultCaseOptions {
  regex: string;
}

/**
 * Type guard for SwitchJobActionOptions
 */
export function isSwitchJobActionOptions(
  options: unknown,
): options is SwitchJobActionOptions {
  if (typeof options === "object" && options !== null) {
    const opts = options as SwitchJobActionOptions;
    return (
      opts.actionType === actionType &&
      typeof opts.scope === "string" &&
      Object.values(SwitchScope).includes(opts.scope as SwitchScope) &&
      typeof opts.property === "string" &&
      Array.isArray(opts.cases) &&
      opts.cases.every(isCaseOptions)
    );
  }
  return false;
}

/**
 * Type guard for CaseOptions
 */
export function isCaseOptions(options: unknown): options is CaseOptions {
  if (typeof options !== "object" || options === null) {
    return false;
  }

  const opts = options as CaseOptions;
  return Array.isArray(opts.actions);
}
