import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Ownable } from "src/common/schemas/ownable.schema";
import { v4 as uuidv4 } from "uuid";
import { DataFile, DataFileSchema } from "../../common/schemas/datafile.schema";

export type OrigDatablockDocument = OrigDatablock & Document;

@Schema({
  collection: "OrigDatablock",
})
export class OrigDatablock extends Ownable {
  @ApiProperty({
    type: String,
    default: uuidv4(),
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: uuidv4(),
  })
  _id: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: String, ref: "Dataset", required: false })
  datasetId: string;

  @ApiProperty({ type: Number })
  @Prop({
    type: Number,
    required: true,
  })
  size: number;

  @ApiProperty()
  @Prop([DataFileSchema])
  dataFileList: DataFile[];
}

export const OrigDatablockSchema = SchemaFactory.createForClass(OrigDatablock);
