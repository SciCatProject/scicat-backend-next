import { AppAbility } from "../casl-ability.factory";
import { CaslSubjectKeys } from "../types/casl-subject-keys.enum";

interface IAccessHandler {
  handle(ability: AppAbility): boolean;
}

type AccessHandlerCallback = (ability: AppAbility) => boolean;

export type AccessHandler = IAccessHandler | AccessHandlerCallback;

export interface IEndpointCheck {
  subject: CaslSubjectKeys;
  handler: AccessHandler;
}
