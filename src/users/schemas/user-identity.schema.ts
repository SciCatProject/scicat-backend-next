import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserProfile } from "./user-profile.schema";
import { ApiProperty } from "@nestjs/swagger";

export type UserIdentityDocument = UserIdentity & Document;

@Schema({
  collection: "UserIdentity",
  toJSON: {
    getters: true,
  },
  timestamps: { createdAt: "created", updatedAt: "modified" },
})
export class UserIdentity {
  @ApiProperty()
  @Prop()
  authStrategy: string;

  @ApiProperty({ type: Date })
  @Prop({ type: Date })
  created: Date;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  credentials: Record<string, unknown>;

  @ApiProperty()
  @Prop()
  externalId: string;

  @ApiProperty({ type: Date })
  @Prop({ type: Date })
  modified: Date;

  @ApiProperty({ type: UserProfile })
  @Prop({ type: UserProfile })
  profile: UserProfile;

  @ApiProperty()
  @Prop()
  provider: string;

  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: string;
}

export const UserIdentitySchema = SchemaFactory.createForClass(UserIdentity);
