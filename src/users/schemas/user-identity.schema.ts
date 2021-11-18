import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserProfile } from "./user-profile.schema";

export type UserIdentityDocument = UserIdentity & Document;

@Schema({
  collection: "UserIdentity",
})
export class UserIdentity {
  @Prop()
  authScheme: string;

  @Prop()
  created: Date;

  @Prop({ type: Object })
  credentials: Record<string, unknown>;

  @Prop()
  externalId: string;

  @Prop()
  modified: Date;

  @Prop({ type: UserProfile })
  profile: UserProfile;

  @Prop()
  provider: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: string;
}

export const UserIdentitySchema = SchemaFactory.createForClass(UserIdentity);
