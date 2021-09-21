import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'User',
})
export class User {
  @ApiProperty()
  @Prop()
  _id: string;

  @ApiProperty()
  @Prop()
  realm: string;

  @ApiProperty()
  @Prop({ required: true })
  username: string;

  @ApiProperty()
  @Prop({ required: true })
  password: string;

  @ApiProperty()
  @Prop({ required: true })
  email: string;

  @ApiProperty()
  @Prop()
  emailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
