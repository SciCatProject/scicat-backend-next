import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

// This class defines the externalLinks field in a dataset.
// That field is not represented in the Mongoose data store,
// so there is no equivalent schema representation for it.

export class ExternalLinkClass {
  @ApiProperty({
    type: String,
    required: true,
    description: "URL of the external link.",
  })
  @IsString()
  readonly url: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Text to display representing the external link.",
  })
  @IsString()
  readonly title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Description of the link destination.",
  })
  @IsString()
  readonly description?: string;
}
