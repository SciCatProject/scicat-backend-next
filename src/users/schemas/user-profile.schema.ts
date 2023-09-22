import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from "mongoose";

export type UserProfileDocument = UserProfile & Document;

@Schema()
export class UserProfile {
  @Prop()
  displayName?: string;

  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop()
  thumbnailPhoto?: string;

  @Prop()
  id?: string;

  @Prop({type: [Object]})
  emails?: Record<string, string>[];

  @Prop({type: [String]})
  accessGroups: string[];
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
