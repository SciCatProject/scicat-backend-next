import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class Ownable {
  @ApiProperty({
    type: String,
    description:
      "Defines the group which owns the data, and therefore has unrestricted access to this data. Usually a pgroup like p12151",
  })
  @Prop({ type: String, index: true })
  ownerGroup: string;

  @ApiProperty({
    type: [String],
    description:
      "Optional additional groups which have read access to the data. Users which are member in one of the groups listed here are allowed to access this data. The special group 'public' makes data available to all users",
  })
  @Prop({ type: [String], index: true })
  accessGroups: string[];

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Optional additional groups which have read and write access to the data. Users which are member in one of the groups listed here are allowed to access this data.",
  })
  @Prop({ type: String, required: false })
  instrumentGroup: string;

  @ApiProperty()
  @Prop({ type: String, index: true })
  createdBy: string;

  @ApiProperty()
  @Prop({ type: String })
  updatedBy: string;
}
