import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Document } from "mongoose";

export type UserProfileDocument = UserProfile & Document;

@Schema()
export class UserProfile {
  @ApiPropertyOptional()
  @Prop()
  displayName?: string;

  @ApiProperty()
  @Prop()
  email: string;

  @ApiProperty()
  @Prop()
  username: string;

  @ApiPropertyOptional()
  @Prop()
  thumbnailPhoto?: string;

  @ApiPropertyOptional()
  @Prop()
  id?: string;

  @ApiPropertyOptional({ type: [Object] })
  @Prop({ type: [Object] })
  emails?: Record<string, string>[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  accessGroups: string[];

  @ApiPropertyOptional({ type: [Object] })
  @Prop({ type: Object })
  oidcClaims?: Record<string, unknown>;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
