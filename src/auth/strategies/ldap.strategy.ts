import * as Strategy from 'passport-ldapauth';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserIdentityDto } from 'src/users/dto/create-user-identity.dto';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super(configService.get<Record<string, any>>('ldap'));
  }

  async validate(payload: any) {
    const userExists = await this.usersService.userExists({
      $or: [
        { username: `ldap.${payload.displayName}` },
        { email: payload.mail },
      ],
    });

    if (!userExists) {
      const createUser: CreateUserDto = {
        username: `ldap.${payload.displayName}`,
        email: payload.mail,
      };
      const user = await this.usersService.create(createUser);

      const createUserIdentity: CreateUserIdentityDto = {
        authScheme: 'ldap',
        created: new Date(),
        credentials: {},
        externalId: payload.sAMAccountName,
        modified: new Date(),
        profile: {
          displayName: payload.displayName,
          email: payload.mail,
          username: payload.displayName,
          thumbnailPhoto: payload.thumbnailPhoto
            ? 'data:image/jpeg;base64,' +
              Buffer.from(payload.thumbnailPhoto, 'binary').toString('base64')
            : 'error: no photo found',
          emails: [{ value: [].concat(payload.mail)[0] }],
          accessGroups: [],
          id: payload.sAMAccountName,
        },
        provider: 'ldap',
        userId: user._id,
      };

      if (this.configService.get<string>('site') === 'ESS') {
        createUserIdentity.profile.accessGroups = ['ess', 'loki', 'odin'];
      }

      await this.usersService.createUserIdentity(createUserIdentity);
    }

    return {
      username: `ldap.${payload.displayName}`,
      email: payload.mail,
    };
  }
}
