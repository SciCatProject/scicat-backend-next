import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type TechniqueDocument = Technique & Document;

@Schema()
export class Technique {
  @ApiProperty({
    type: String,
    description: "Persistent Identifier dervied from UUIDv4",
  })
  @Prop({ type: String, unique: true, sparse: true })
  pid: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "The name of the technique",
  })
  @Prop({ type: String, required: true })
  name: string;
}

export const TechniqueSchema = SchemaFactory.createForClass(Technique);
