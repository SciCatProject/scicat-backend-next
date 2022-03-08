import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateProposalDto extends OwnableDto {
  @ApiProperty()
  readonly ownerGroup: string;

  @ApiProperty()
  readonly accessGroups: string[];

  @ApiProperty()
  proposalId: string;

  @ApiProperty()
  readonly pi_email: string;

  @ApiProperty()
  readonly pi_firstname: string;

  @ApiProperty()
  readonly pi_lastname: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly firstname: string;

  @ApiProperty()
  readonly lastname: string;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly abstract: string;

  @ApiProperty()
  readonly startTime?: Date;

  @ApiProperty()
  readonly endTime?: Date;
}
