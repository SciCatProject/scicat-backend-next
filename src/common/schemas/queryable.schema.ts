import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class QueryableClass {
  @ApiProperty({
    type: String,
    description: "Indicate the user who created this record. This property is added and mantained by the system",
  })
  @Prop({ 
    type: String, 
    index: true, 
    required: true,
  })
  createdBy: string;

  @ApiProperty({
    type: String,
    description: "Indicate the user who updated this record last. This property is added and mantained by the system",
  })
  @Prop({ 
    type: String,
    required: true,    
  })
  updatedBy: string;

  @ApiProperty({
    type: Date,
    description: "Date and time when this record was created. This property is added and mantained by the system"
  })
  @Prop({ 
    type: Date,
    required: true,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: "Date and time when this record was updated last. This property is added and mantained by the system"
  })
  @Prop({ 
    type: Date,
    required: true,
  })
  updatedAt: Date;
}
