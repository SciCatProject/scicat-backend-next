import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { PoliciesGuard } from "src/casl/guards/policies.guard";

export class AuthenticatedPoliciesGuard
  extends PoliciesGuard
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("Unauthenticated");
    }

    return super.canActivate(context);
  }
}
