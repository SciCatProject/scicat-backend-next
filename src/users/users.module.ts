import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  UserIdentity,
  UserIdentitySchema,
} from './schemas/user-identity.schema';
import { RolesService } from './roles.service';
import { Role, RoleSchema } from './schemas/role.schema';
import { UserRole, UserRoleSchema } from './schemas/user-role.schema';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserIdentity.name,
        schema: UserIdentitySchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
      {
        name: UserRole.name,
        schema: UserRoleSchema,
      },
    ]),
  ],
  providers: [CaslAbilityFactory, UsersService, RolesService],
  exports: [UsersService, RolesService],
  controllers: [UsersController],
})
export class UsersModule {}
