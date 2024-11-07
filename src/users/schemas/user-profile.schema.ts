import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type UserProfileDocument = UserProfile & Document;

@Schema()
export class UserProfile {
  @ApiProperty()
  @Prop()
  displayName?: string;

  @ApiProperty()
  @Prop()
  email: string;

  @ApiProperty()
  @Prop()
  username: string;

  @ApiProperty()
  @Prop()
  thumbnailPhoto?: string;

  @ApiProperty()
  @Prop()
  id?: string;

  @ApiProperty({ type: [Object] })
  @Prop({ type: [Object] })
  emails?: Record<string, string>[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  accessGroups: string[];

  @ApiProperty({ type: [Object] })
  @Prop({ type: Object })
  oidcClaims?: Record<string, unknown>;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
