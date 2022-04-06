import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import {
  UserIdentity,
  UserIdentityDocument,
} from "./schemas/user-identity.schema";

@Injectable()
export class UserIdentitiesService {
  constructor(
    @InjectModel(UserIdentity.name)
    private userIdentityModel: Model<UserIdentityDocument>,
  ) {}

  async findOne(
    filter: FilterQuery<UserIdentityDocument>,
  ): Promise<UserIdentity | null> {
    return this.userIdentityModel.findOne(filter).exec();
  }
}
