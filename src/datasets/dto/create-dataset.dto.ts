import { OwnableDto } from "src/common/dto/ownable.dto";
import { TechniqueClass } from "../schemas/technique.schema";
import { RelationshipClass } from "../schemas/relationship.schema";
import {
  IsString,
  IsOptional,
  IsEmail,
  IsFQDN,
  IsInt,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsObject,
  IsArray,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { DatasetType } from "../dataset-type.enum";
import { Type } from "class-transformer";
import { CreateRelationshipDto } from "./create-relationship.dto";
import { CreateTechniqueDto } from "./create-technique.dto";
import { LifecycleClass } from "../schemas/lifecycle.schema";

@ApiTags("datasets")
export class CreateDatasetDto extends OwnableDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Owner or custodian of the data set, usually first name + lastname. The string may contain a list of persons, which should then be seperated by semicolons.",
  })
  @IsString()
  readonly owner: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Email of owner or of custodian of the data set. The string may contain a list of emails, which should then be seperated by semicolons.",
  })
  @IsEmail()
  readonly ownerEmail?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "ORCID of owner/custodian. The string may contain a list of ORCID, which should then be separated by semicolons.",
  })
  @IsOptional()
  @IsString()
  readonly orcidOfOwner?: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Email of contact person for this dataset. The string may contain a list of emails, which should then be seperated by semicolons.",
  })
  @IsEmail()
  readonly contactEmail: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Absolute file path on file server containing the files of this dataset, e.g. /some/path/to/sourcefolder. In case of a single file dataset, e.g. HDF5 data, it contains the path up to, but excluding the filename. Trailing slashes are removed.",
  })
  @IsString()
  readonly sourceFolder: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "DNS host name of file server hosting sourceFolder, optionally including protocol e.g. [protocol://]fileserver1.example.com",
  })
  @IsOptional()
  @IsFQDN()
  readonly sourceFolderHost?: string;

  /*
   * size and number of files fields should be managed by the system
   */
  @ApiProperty({
    type: Number,
    default: 0,
    required: false,
    description:
      "Total size of all source files contained in source folder on disk when unpacked",
  })
  @IsOptional()
  @IsInt()
  readonly size?: number = 0;

  @ApiProperty({
    type: Number,
    default: 0,
    required: false,
    description:
      "Total size of all datablock package files created for this dataset",
  })
  @IsOptional()
  @IsInt()
  readonly packedSize?: number = 0;

  @ApiProperty({
    type: Number,
    default: 0,
    required: false,
    description:
      "Total number of lines in filelisting of all OrigDatablocks for this dataset",
  })
  @IsOptional()
  @IsInt()
  readonly numberOfFiles?: number = 0;

  @ApiProperty({
    type: Number,
    default: 0,
    required: true,
    description:
      "Total number of lines in filelisting of all Datablocks for this dataset",
  })
  @IsOptional()
  @IsInt()
  readonly numberOfFilesArchived?: number;

  @ApiProperty({
    type: Date,
    required: true,
    description:
      "Time when dataset became fully available on disk, i.e. all containing files have been written. Format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.",
  })
  @IsDateString()
  readonly creationTime: Date;

  @ApiProperty({
    type: String,
    required: true,
    enum: [DatasetType.Raw, DatasetType.Derived],
    description:
      "Characterize type of dataset, either 'base' or 'raw' or 'derived'. Autofilled when choosing the proper inherited models",
  })
  @IsEnum(DatasetType)
  readonly type: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Defines a level of trust, e.g. a measure of how much data was verified or used by other persons",
  })
  @IsOptional()
  @IsString()
  readonly validationStatus?: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "Array of tags associated with the meaning or contents of this dataset. Values should ideally come from defined vocabularies, taxonomies, ontologies or knowledge graphs",
  })
  @IsOptional()
  @IsString({
    each: true,
  })
  readonly keywords?: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: "Free text explanation of contents of dataset",
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "A name for the dataset, given by the creator to carry some semantic meaning. Useful for display purposes e.g. instead of displaying the pid. Will be autofilled if missing using info from sourceFolder",
  })
  @IsOptional()
  @IsString()
  readonly datasetName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "ACIA information about AUthenticity,COnfidentiality,INtegrity and AVailability requirements of dataset. E.g. AV(ailabilty)=medium could trigger the creation of a two tape copies. Format 'AV=medium,CO=low'",
  })
  @IsOptional()
  @IsString()
  readonly classification?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Name of license under which data can be used",
  })
  @IsOptional()
  @IsString()
  readonly license?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Version of API used in creation of dataset",
  })
  @IsOptional()
  @IsString()
  readonly version?: string;

  // it needs to be discussed if this fields is managed by the user or by the system
  @ApiProperty({
    type: Boolean,
    required: false,
    default: false,
    description: "Flag is true when data are made publically available",
  })
  @IsOptional()
  @IsBoolean()
  readonly isPublished?: boolean;

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(TechniqueClass) },
    required: false,
    default: [],
    description: "Stores the metadata information for techniques",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTechniqueDto)
  readonly techniques?: TechniqueClass[];

  // it needs to be discussed if this fields is managed by the user or by the system
  @ApiProperty({
    type: [String],
    required: false,
    default: [],
    description: "List of users that the dataset has been shared with",
  })
  @IsOptional()
  @IsString({
    each: true,
  })
  readonly sharedWith?: string[];

  // it needs to be discussed if this fields is managed by the user or by the system
  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(RelationshipClass) },
    required: false,
    default: [],
    description: "Stores the relationships with other datasets",
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRelationshipDto)
  readonly relationships?: RelationshipClass[];

  @ApiProperty({
    type: LifecycleClass,
    required: false,
    default: {},
    description:
      "For each dataset there exists an embedded dataset lifecycle document which describes the current status of the dataset during its lifetime with respect to the storage handling systems",
  })
  @IsOptional()
  readonly datasetlifecycle: LifecycleClass;

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
    description: "JSON object containing the scientific metadata",
  })
  @IsOptional()
  @IsObject()
  readonly scientificMetadata?: Record<string, unknown>;
}
