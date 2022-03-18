import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type DataFileDocument = DataFile & Document;

@Schema()
export class DataFile {
  @ApiProperty({
    type: String,
    description: "Relative path of the file within the dataset folder",
  })
  @Prop({ type: String, required: true })
  path: string;

  @ApiProperty({ type: Number, description: "Uncompressed file size in bytes" })
  @Prop()
  size: number;

  @ApiProperty({
    type: Date,
    description:
      "Time of file creation on disk, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server",
  })
  @Prop()
  time: Date;

  @ApiProperty({
    type: String,
    description: "Checksum for the file, e.g. its sha-2 hashstring",
  })
  @Prop()
  chk: string;

  @ApiProperty({
    type: String,
    description: "optional: user ID name as seen on filesystem",
  })
  @Prop()
  uid: string;

  @ApiProperty({
    type: String,
    description: "optional: group ID name as seen on filesystem",
  })
  @Prop()
  gid: string;

  @ApiProperty({ type: String, description: "optional: Posix permission bits" })
  @Prop()
  perm: string;
}

export const DataFileSchema = SchemaFactory.createForClass(DataFile);
