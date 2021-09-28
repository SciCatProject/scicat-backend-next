import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserIdentityDto } from './dto/create-user-identity.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UserIdentity,
  UserIdentityDocument,
} from './schemas/user-identity.schema';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserIdentity.name)
    private userIdentityModel: Model<UserIdentityDocument>,
  ) {}

  async onModuleInit() {
    const functionalAccounts =
      this.configService.get<User[]>('functionalAccounts');

    if (functionalAccounts && functionalAccounts.length > 0) {
      functionalAccounts.forEach(async (account) => {
        await this.create(account);
      });
    }
  }

  async userExists(filter: FilterQuery<UserDocument>): Promise<boolean> {
    return await this.userModel.exists(filter);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userExists({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (userExists) {
      return null;
    }

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
