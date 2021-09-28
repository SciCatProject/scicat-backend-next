import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema({
  collection: 'User',
})
export class User {
  _id: string;

  @ApiProperty()
  @Prop({ required: false })
  realm: string;

  @ApiProperty()
  @Prop({ required: true })
  username: string;

  @ApiProperty()
  @Prop({ required: false })
  password: string;

  @ApiProperty()
  @Prop({ required: true })
  email: string;

  @ApiProperty()
  @Prop({ required: false })
  emailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
