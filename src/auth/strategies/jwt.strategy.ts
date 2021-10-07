import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { RolesService } from 'src/users/roles.service';
import { UsersService } from 'src/users/users.service';

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

  async validate(payload: any) {
    console.log({ payload });
    const roles = await this.rolesService.find({ userId: payload._id });

    const userIdentity = await this.usersService.findByIdUserIdentity(
      payload._id,
    );

    let currentGroups = [];

    if (roles) {
      const roleNames = roles.map(({ name }) => name);
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
    };
  }
}
