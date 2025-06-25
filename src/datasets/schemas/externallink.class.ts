import { ApiProperty } from "@nestjs/swagger";

// This data is not represented in Mongoose.
// It is generated internally based on the user-defined link templates.

export class ExternalLinkClass {
  @ApiProperty({
    type: String,
    required: true,
    description: "URL of the external link.",
  })
  url: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Text to display representing the external link.",
  })
  title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Description of the link destination.",
  })
  description?: string;
}
