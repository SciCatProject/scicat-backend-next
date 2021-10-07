import * as Strategy from 'passport-ldapauth';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserIdentityDto } from 'src/users/dto/create-user-identity.dto';
import { FilterQuery } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super(configService.get<Record<string, any>>('ldap'));
  }

  async validate(payload: any) {
    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: `ldap.${payload.displayName}` },
        { email: payload.mail },
      ],
    };
    const userExists = await this.usersService.userExists(userFilter);

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

    const user = await this.usersService.findOne(userFilter);

    return JSON.parse(JSON.stringify(user));
  }
}
