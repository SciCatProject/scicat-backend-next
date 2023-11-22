import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppAbility, CaslAbilityFactory } from "../casl-ability.factory";
import { CHECK_POLICIES_KEY } from "../decorators/check-policies.decorator";
import { PolicyHandler } from "../interfaces/policy-handler.interface";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const ability = this.caslAbilityFactory.createForUser(user);
    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    //console.log('PoliciesGuard:execPolicyHandler ', handler, ability)
    if (typeof handler === "function") {
      const res = handler(ability);
      //console.log("PoliciesGuard:execPolicyHandler ", res);
      return res;
    }
    return handler.handle(ability);
  }
}
