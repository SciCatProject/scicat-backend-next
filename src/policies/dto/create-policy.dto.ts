import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreatePolicyDto extends OwnableDto {
  @ApiProperty({ type: [String] })
  readonly manager: string[];

  @ApiProperty()
  readonly tapeRedundancy: string;

  @ApiProperty()
  readonly autoArchive: boolean;

  @ApiProperty()
  readonly autoArchiveDelay: number;

  @ApiProperty()
  readonly archiveEmailNotification: boolean;

  @ApiProperty({ type: [String] })
  readonly archiveEmailsToBeNotified: string[];

  @ApiProperty()
  readonly retrieveEmailNotification: boolean;

  @ApiProperty({ type: [String] })
  readonly retrieveEmailsToBeNotified: string[];

  @ApiProperty()
  readonly embargoPeriod: number;
}
