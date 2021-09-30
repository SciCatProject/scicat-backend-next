import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { UserRole, UserRoleDocument } from './schemas/user-role.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRoleDocument>,
  ) {}

  async onModuleInit() {
    const createRole: CreateRoleDto = {
      name: 'globalaccess',
      created: new Date(),
      modified: new Date(),
    };
    await this.findOrCreate(createRole);
  }

  async roleExists(filter: FilterQuery<RoleDocument>): Promise<boolean> {
    return await this.roleModel.exists(filter);
  }

  async userRoleExists(
    filter: FilterQuery<UserRoleDocument>,
  ): Promise<boolean> {
    return await this.userRoleModel.exists(filter);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    Logger.log(`Creating role ${createRoleDto.name}`, 'RolesService');

    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findOrCreate(createRoleDto: CreateRoleDto): Promise<Role> {
    const roleExists = await this.roleExists({ name: createRoleDto.name });

    if (roleExists) {
      return await this.findOne({ name: createRoleDto.name });
    }

    return await this.create(createRoleDto);
  }

  async createUserRole(
    createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRole> {
    Logger.log(
      `Create user role mapping for userId: ${createUserRoleDto.userId} and roleId: ${createUserRoleDto.roleId}`,
      'RolesService',
    );

    const createdUserRole = new this.userRoleModel(createUserRoleDto);
    return createdUserRole.save();
  }

  async findOrCreateUserRole(
    createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRole> {
    const filter: FilterQuery<UserRoleDocument> = {
      $and: [
        { userId: createUserRoleDto.userId },
        { roleId: createUserRoleDto.roleId },
      ],
    };
    const userRoleExists = await this.userRoleExists(filter);

    if (userRoleExists) {
      return await this.findOneUserRole(filter);
    }

    return await this.createUserRole(createUserRoleDto);
  }

  async findOne(filter: FilterQuery<RoleDocument>): Promise<Role> {
    return this.roleModel.findOne(filter).exec();
  }

  async findOneUserRole(
    filter: FilterQuery<UserRoleDocument>,
  ): Promise<UserRole> {
    return this.userRoleModel.findOne(filter).exec();
  }
}
