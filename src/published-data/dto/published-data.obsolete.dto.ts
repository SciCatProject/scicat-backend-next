import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class PublishedDataObsoleteDto {
  @IsString()
  _id: string;

  @ApiProperty({
    type: String,
    description:
      "Digital Object Identifier; e.g.," +
      ' "10.xxx/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d".',
  })
  @IsString()
  doi: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Creator Affiliation.  This field has the semantics of" +
      " [DataCite Creator/affiliation](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/creator/#affiliation).",
  })
  @IsString()
  @IsOptional()
  affiliation?: string;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Creator of dataset/dataset collection.  This field has the semantics" +
      " of Dublin Core [dcmi:creator](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/creator/)" +
      " and [DataCite Creator/creatorName](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/creator/#creatorname).",
  })
  @IsString({ each: true })
  creator: string[];

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Dataset publisher.  This field has the semantics of Dublin Core" +
      " [dcmi:publisher](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/publisher/)" +
      " and [DataCite publisher](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/publisher).",
  })
  @IsString()
  publisher: string;

  @ApiProperty({
    type: Number,
    required: true,
    description:
      "Year of publication.  This field has the semantics of Dublin Core" +
      " [dcmi:date](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/date/)" +
      " and [DataCite publicationYear](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/publicationyear/).",
  })
  @IsNumber()
  publicationYear: number;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "The title of the data.  This field has the semantics of Dublin Core" +
      " [dcmi:title](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/title/)" +
      " and [DataCite title](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/title/).",
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Full URL to the landing page for this DOI",
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Abstract text for published datasets.  This field has the semantics" +
      " of [DataCite description](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/description/)" +
      " with [Abstract descriptionType](https://datacite-metadata-schema.readthedocs.io/en/4.5/appendices/appendix-1/descriptionType/#abstract).",
  })
  @IsString()
  abstract: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Link to description of how to re-use data.  This field has the" +
      " semantics of Dublic Core [dcmi:description](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/description/)" +
      " and [DataCite description](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/description/)" +
      " with [Abstract descriptionType](https://datacite-metadata-schema.readthedocs.io/en/4.5/appendices/appendix-1/descriptionType/#abstract).",
  })
  @IsString()
  dataDescription: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "e.g. raw/ derived",
  })
  @IsString()
  resourceType: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: "Number of files",
  })
  @IsNumber()
  @IsOptional()
  numberOfFiles?: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: "Size of archive",
  })
  @IsNumber()
  @IsOptional()
  sizeOfArchive?: number;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Array of one or more Dataset persistent identifier (pid) values that" +
      " make up the published data.",
  })
  @IsString({ each: true })
  pidArray: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: "List of Names of authors of the to be published data",
  })
  @IsString({ each: true })
  @IsOptional()
  authors?: string[];

  @ApiProperty({
    type: Date,
    description: "Time when doi is successfully registered",
  })
  @IsDateString()
  registeredTime: Date;

  @ApiProperty({
    type: String,
    description:
      "Indication of position in publication workflow e.g. doiRegistered",
  })
  @IsString()
  status: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "The username of the user that clicks the publish button in the client",
  })
  @IsString()
  @IsOptional()
  scicatUser?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Small, less than 16 MB base 64 image preview of dataset",
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "List of URLs pointing to related publications like DOI URLS of journal articles",
  })
  @IsString({ each: true })
  @IsOptional()
  relatedPublications?: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: "URL pointing to page from which data can be downloaded",
  })
  @IsString()
  @IsOptional()
  downloadLink?: string;

  @ApiProperty({
    type: Date,
    description:
      "Date when the published data was created. This property is added and maintained by the system",
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description:
      "Date when the published data was last updated. This property is added and maintained by the system",
  })
  @IsDateString()
  updatedAt: Date;
}
