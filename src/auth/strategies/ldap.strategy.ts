import * as Strategy from 'passport-ldapauth';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(private configService: ConfigService) {
    super(configService.get<Record<string, any>>('ldap'));
  }

  async validate(payload: any) {
    return {
      username: payload.sAMAccountName,
      email: payload.mail,
    };
  }
}
