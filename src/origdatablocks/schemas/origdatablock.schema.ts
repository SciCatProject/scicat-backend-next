import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Ownable } from "src/common/schemas/ownable.schema";
import { v4 as uuidv4 } from "uuid";
import { DataFile, DataFileSchema } from "../../common/schemas/datafile.schema";

export type OrigDatablockDocument = OrigDatablock & Document;

@Schema({
  collection: "OrigDatablock",
  toJSON: {
    getters: true,
  },
})
export class OrigDatablock extends Ownable {
  @ApiProperty({
    type: String,
    default: () => uuidv4(),
  })
  @Prop({
    type: String,
    required: true,
    default: () => uuidv4(),
  })
  _id: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "PID of the dataset to which the orig datablock belongs.",
  })
  @Prop({ type: String, ref: "Dataset", required: true })
  datasetId: string;

  @ApiProperty({
    type: Number,
    required: true,
    description:
      "Total size in bytes of all files contained in the dataFileList",
  })
  @Prop({
    type: Number,
    required: true,
  })
  size: number;

  @ApiProperty({
    description:
      "Embedded schema definition for which fields are required for each file",
  })
  @Prop([DataFileSchema])
  dataFileList: DataFile[];
}

export const OrigDatablockSchema = SchemaFactory.createForClass(OrigDatablock);

OrigDatablockSchema.index({ "$**": "text" });
