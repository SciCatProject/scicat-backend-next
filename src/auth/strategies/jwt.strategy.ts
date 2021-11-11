import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { jwtConstants } from "../constants";
import { RolesService } from "src/users/roles.service";
import { UsersService } from "src/users/users.service";
import { JWTUser } from "../interfaces/jwt-user.interface";
import { User } from "src/users/schemas/user.schema";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private rolesService: RolesService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: Omit<User, "password">) {
    const roles = await this.rolesService.find({ userId: payload._id });

    const userIdentity = await this.usersService.findByIdUserIdentity(
      payload._id,
    );

    let currentGroups: string[] = [];

    if (roles) {
      const roleNames = roles
        .map((role) => (role ? role.name : ""))
        .filter((name) => name.length > 0);
      currentGroups = currentGroups.concat(roleNames);
    }

    if (userIdentity) {
      currentGroups = currentGroups.concat(userIdentity.profile.accessGroups);
    }

    return {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
      currentGroups,
    } as JWTUser;
  }
}
