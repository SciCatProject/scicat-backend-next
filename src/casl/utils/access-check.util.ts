import { CaslSubjectKeys } from "../types/casl-subject-keys.enum";
import {
  AccessHandler,
  IEndpointCheck,
} from "../interfaces/endpoint-check.interface";

export function accessCheck(
  key: CaslSubjectKeys,
  handler: AccessHandler,
): IEndpointCheck {
  return { subject: key, handler: handler };
}
