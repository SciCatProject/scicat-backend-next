import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserIdentityDto } from './dto/create-user-identity.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from './roles.service';
import {
  UserIdentity,
  UserIdentityDocument,
} from './schemas/user-identity.schema';
import { User, UserDocument } from './schemas/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateUserRoleDto } from './dto/create-user-role.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserIdentity.name)
    private userIdentityModel: Model<UserIdentityDocument>,
  ) {}

  async onModuleInit() {
    const functionalAccounts =
      this.configService.get<CreateUserDto[]>('functionalAccounts');

    if (functionalAccounts && functionalAccounts.length > 0) {
      functionalAccounts.forEach(async (account) => {
        const { role, global, ...createAccount } = account;
        const user = await this.findOrCreate(createAccount);

        if (role) {
          const createRole: CreateRoleDto = {
            name: role,
            created: new Date(),
            modified: new Date(),
          };
          const createdRole = await this.rolesService.findOrCreate(createRole);
          if (createdRole) {
            const createUserRole: CreateUserRoleDto = {
              userId: user._id,
              roleId: createdRole._id,
            };
            await this.rolesService.findOrCreateUserRole(createUserRole);
          }
        }
        if (global) {
          const createRole: CreateRoleDto = {
            name: 'globalaccess',
            created: new Date(),
            modified: new Date(),
          };
          const createdRole = await this.rolesService.findOrCreate(createRole);
          if (createdRole) {
            const createUserRole: CreateUserRoleDto = {
              userId: user._id,
              roleId: createdRole._id,
            };
            await this.rolesService.findOrCreateUserRole(createUserRole);
          }
        }
      });
    }
  }

  async userExists(filter: FilterQuery<UserDocument>): Promise<boolean> {
    return await this.userModel.exists(filter);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    Logger.log(`Creating user ${createUserDto.username}`, 'UsersService');

    if (!createUserDto.password && createUserDto.username.startsWith('ldap')) {
      const createdUser = new this.userModel(createUserDto);
      return createdUser.save();
    }

    const hashedPassword = await hash(createUserDto.password, await genSalt());
    const createUser = { ...createUserDto, password: hashedPassword };
    const createdUser = new this.userModel(createUser);
    return createdUser.save();
  }

  async findOrCreate(createUserDto: CreateUserDto): Promise<User> {
    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    };
    const userExists = await this.userExists(userFilter);

    if (userExists) {
      return await this.findOne(userFilter);
    }

    return await this.create(createUserDto);
  }

  async findOne(filter: FilterQuery<UserDocument>): Promise<User | undefined> {
    return this.userModel.findOne(filter).exec();
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userModel.findById(id).exec();
  }

  async createUserIdentity(
    createUserIdentityDto: CreateUserIdentityDto,
  ): Promise<UserIdentity> {
    const createdUserIdentity = new this.userIdentityModel(
      createUserIdentityDto,
    );
    return createdUserIdentity.save();
  }

  async findByIdUserIdentity(
    userId: string,
  ): Promise<UserIdentity | undefined> {
    console.log({ userId });
    return this.userIdentityModel.findOne({ userId }).exec();
  }
}
