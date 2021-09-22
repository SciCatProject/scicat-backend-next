import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userModel.exists({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (userExists) {
      return null;
    }

    Logger.log(
      `Creating functional account ${createUserDto.username}`,
      'UsersService',
    );
    const hashedPassword = await hash(createUserDto.password, await genSalt());
    const createUser = { ...createUserDto, password: hashedPassword };
    const createdUser = new this.userModel(createUser);
    return createdUser.save();
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }
}
