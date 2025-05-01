import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsString,IsBoolean } from "class-validator";

export class OutputDatasetLifecycleDto {
      @ApiProperty({
        type: Boolean,
        required: false,
        description:
          "Flag indicating if dataset is available to be archived and no archive job for this dataset exists yet.",
      })
      @IsBoolean()
      archivable: boolean;
    
      @ApiProperty({
        type: Boolean,
        required: false,
        description:
          "Flag indicating if dataset is stored on archive system and is ready to be retrieved.",
      })
      @IsBoolean()
      retrievable: boolean;
    
      @ApiProperty({
        type: Boolean,
        required: false,
        description:
          "Flag indicating if dataset can be published. Usually requires a longterm storage option on tape or similar.",
      })
      @IsBoolean()
      publishable: boolean;
      
      @ApiProperty({
        type: Date,
        required: false,
        description:
          "Day when dataset will be removed from disk, assuming that is already stored on tape.",
      })
      @IsDateString()
      dateOfDiskPurging: Date;
      
      @ApiProperty({
        type: Date,
        required: false,
        description:
          "Day when the dataset's future fate will be evaluated again, e.g. to decide if the dataset can be deleted from archive.",
      })
      @IsDateString()
      archiveRetentionTime: Date;
      
      @ApiProperty({
        type: Date,
        required: false,
        description:
          "Day when dataset is supposed to become public according to data policy.",
      })
      @IsDateString()
      dateOfPublishing: Date;
      
      @ApiProperty({
        type: Date,
        required: false,
        description: "Day when dataset was published.",
      })
      @IsDateString()
      publishedOn: Date;
      
      @ApiProperty({
        type: Boolean,
        required: false,
        description:
          "Flag indicating if full dataset is available on central fileserver. If false, data needs to be copied from decentral storage places to a cache server before the ingest. This information needs to be transferred to the archive system at archive time.",
      })
      @IsBoolean()
      isOnCentralDisk: boolean;
      
      @ApiProperty({
        type: String,
        required: false,
        default: "",
        description:
          "Short string defining the current status of the dataset with respect to storage on disk/tape.",
      })
      @IsString()
      archiveStatusMessage: string;
      
      @ApiProperty({
        type: String,
        required: false,
        default: "",
        description:
          "Latest message for this dataset concerning retrieval from archive system.",
      })
      @IsString()
      retrieveStatusMessage: string;
      
      @ApiProperty({
        type: Object,
        required: false,
        default: {},
        description:
          "Detailed status or error message returned by the archive system when archiving this dataset.",
      })
      archiveReturnMessage: unknown;
      
      @ApiProperty({
        type: Object,
        required: false,
        default: {},
        description:
          "Detailed status or error message returned by the archive system when retrieving this dataset.",
      })
      retrieveReturnMessage: unknown;
    
      @ApiProperty({
        type: String,
        required: false,
        description: "Location of the last export destination.",
      })
      exportedTo: string;
    
      @ApiProperty({
        type: Boolean,
        required: false,
        default: false,
        description:
          "Set to true when checksum tests after retrieve of datasets were successful.",
      })
      @IsBoolean()
      retrieveIntegrityCheck: boolean;
    }