import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type RoleDocument = Role & Document;

@Schema({
  collection: "Role",
  toJSON: {
    getters: true,
  },
  timestamps: { createdAt: "created", updatedAt: "modified" },
})
export class Role {
  _id: string;

  @ApiProperty({ type: String, description: "The name of the role" })
  @Prop({ type: String, unique: true })
  name: string;

  @ApiProperty({
    type: Date,
    description:
      "The date when the role was created. This is handled automatically by mongoose",
  })
  @Prop({ type: Date })
  created: Date;

  @ApiProperty({
    type: Date,
    description:
      "The date when the role was last modified. This is handled automatically by mongoose",
  })
  @Prop({ type: Date })
  modified: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
