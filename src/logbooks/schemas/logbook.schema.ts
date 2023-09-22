import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ApiProperty, getSchemaPath} from "@nestjs/swagger";
import {Document} from "mongoose";
import {Message, MessageSchema} from "./message.schema";

export type LogbookDocument = Logbook & Document;

@Schema()
export class Logbook {
  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop()
  roomId: string;

  @ApiProperty({type: "array", items: {$ref: getSchemaPath(Message)}})
  @Prop([MessageSchema])
  messages: Message[];
}

export const LogbookSchema = SchemaFactory.createForClass(Logbook);

LogbookSchema.index({"$**": "text"});
