import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type TechniqueDocument = TechniqueClass & Document;

@Schema()
export class TechniqueClass {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Persistent Identifier of the technique. Usually it is a UUIDv4.",
  })
  @Prop({ type: String, required: true, sparse: true })
  pid: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "The name of the technique.",
  })
  @Prop({ type: String, required: true })
  name: string;
}

export const TechniqueSchema = SchemaFactory.createForClass(TechniqueClass);
