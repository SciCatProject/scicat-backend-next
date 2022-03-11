import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { DataFile, DataFileSchema } from "src/common/schemas/datafile.schema";
import { Ownable } from "src/common/schemas/ownable.schema";
import { v4 as uuidv4 } from "uuid";

export type DatablockDocument = Datablock & Document;

@Schema({
  collection: "Datablock",
})
export class Datablock extends Ownable {
  @ApiProperty({
    type: String,
    default: () => uuidv4(),
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4(),
  })
  _id: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, ref: "Dataset", required: true })
  datasetId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true })
  archiveId: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  size: number;

  @ApiProperty()
  @Prop()
  packedSize: number;

  @ApiProperty()
  @Prop()
  chkAlg: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  version: string;

  @ApiProperty()
  @Prop([DataFileSchema])
  dataFileList: DataFile[];
}

export const DatablockSchema = SchemaFactory.createForClass(Datablock);
