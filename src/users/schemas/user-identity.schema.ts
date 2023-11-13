import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserProfile } from "./user-profile.schema";

export type UserIdentityDocument = UserIdentity & Document;

@Schema({
  collection: "UserIdentity",
  toJSON: {
    getters: true,
  },
  timestamps: { createdAt: "created", updatedAt: "modified" },
})
export class UserIdentity {
  @Prop()
  authStrategy: string;

  @Prop({ type: Date })
  created: Date;

  @Prop({ type: Object })
  credentials: Record<string, unknown>;

  @Prop()
  externalId: string;

  @Prop({ type: Date })
  modified: Date;

  @Prop({ type: UserProfile })
  profile: UserProfile;

  @Prop()
  provider: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: string;
}

export const UserIdentitySchema = SchemaFactory.createForClass(UserIdentity);
