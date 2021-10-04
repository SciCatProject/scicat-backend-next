import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { RolesService } from 'src/users/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private rolesService: RolesService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log({ payload });
    const roles = await this.rolesService.find({ userId: payload._id });
    const roleNames = roles.map(({ name }) => name);

    return {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
      roles: roleNames ?? [],
    };
  }
}
