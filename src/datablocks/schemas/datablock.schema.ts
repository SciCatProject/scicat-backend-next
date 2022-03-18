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
    description: "Catalog internal UUIDv4 for datablock",
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4(),
  })
  _id: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "PID of the dataset to which the datablock belongs",
  })
  @Prop({ type: String, ref: "Dataset", required: true })
  datasetId: string;

  @ApiProperty({
    type: String,
    description:
      "Unique identifier given bey archive system to the stored datablock. This id is used when data is retrieved back.",
  })
  @Prop({ type: String, required: true, unique: true })
  archiveId: string;

  @ApiProperty({
    type: Number,
    description: "Total size in bytes of all files in datablock when unpacked",
  })
  @Prop({ type: Number, required: true })
  size: number;

  @ApiProperty({ type: Number, description: "Size of datablock package file" })
  @Prop()
  packedSize: number;

  @ApiProperty({
    type: String,
    description: "Algoritm used for calculation of checksums, e.g. sha2",
  })
  @Prop()
  chkAlg: string;

  @ApiProperty({
    type: String,
    description:
      "Version string defining format of how data is packed and stored in archive",
  })
  @Prop({ type: String, required: true })
  version: string;

  @ApiProperty()
  @Prop([DataFileSchema])
  dataFileList: DataFile[];
}

export const DatablockSchema = SchemaFactory.createForClass(Datablock);
