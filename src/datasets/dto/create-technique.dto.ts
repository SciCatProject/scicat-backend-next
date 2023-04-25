import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTechniqueDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Persistent Identifier of the technique. Usually it is a UUIDv4.",
  })
  @IsString()
  readonly pid: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "The name of the technique.",
  })
  @IsString()
  readonly name: string;
}
