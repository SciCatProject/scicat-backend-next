import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { PublishedDataStatus } from "../interfaces/published-data.interface";

export class UpdatePublishedDataDto {
  /**
   * Creator of dataset collection.
   * This field has the semantics of Dublin Core [dcmi:creator](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/creator/)
   * and [DataCite Creator](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/creator).
   */
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  readonly creator: string[];

  /**
   * Dataset publisher. This field has the semantics of Dublin Core
   * [dcmi:publisher](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/publisher/)
   * and [DataCite publisher](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/publisher).
   */
  @IsString()
  readonly publisher: string;

  /**
   * Year of publication. This field has the semantics of Dublin Core
   * [dcmi:date](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/date/)
   * and [DataCite publicationYear](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/publicationyear/).
   */
  @IsNumber()
  readonly publicationYear: number;

  /**
   * The title of the data. This field has the semantics of Dublin Core
   * [dcmi:title](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/title/)
   * and [DataCite title](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/title/).
   */
  @IsString()
  readonly title: string;

  /**
   * Full URL to the landing page for this DOI
   */
  @IsString()
  @IsOptional()
  readonly url?: string;

  /**
   * Abstract text for published datasets. This field has the semantics of
   * [DataCite description](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/description/)
   * with [Abstract](https://datacite-metadata-schema.readthedocs.io/en/4.5/appendices/appendix-1/descriptionType/#abstract).
   */
  @IsString()
  readonly abstract: string;

  /**
   * Free text. This field has the semantics of
   * [DataCite resourceType](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/resourcetype/)
   */
  @IsString()
  readonly resourceType: string;

  /**
   * Array of one or more Dataset persistent identifier (pid) values that make up the published data.
   */
  @IsArray()
  @IsString({ each: true })
  readonly datasetPids: string[];

  /**
   * The institution or person responsible for collecting, managing, distributing, or otherwise contributing to the development of the resource.
   * This field has the semantics of
   * [DataCite contributor](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/contributor/)
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly contributors?: string[];

  /**
   * Time when doi is successfully registered
   */
  @IsDateString()
  @IsOptional()
  readonly registeredTime?: Date;

  /**
   * Indication of position in publication workflow e.g. registred, private, public
   */
  @IsEnum(PublishedDataStatus)
  @IsOptional()
  readonly status?: string;

  /**
   * Small, less than 16 MB base 64 image preview of dataset
   */
  @IsString()
  @IsOptional()
  readonly thumbnail?: string;

  /**
   * Identifiers of related resources. This field has the semantics of
   * [DataCite relatedIdentifier](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/relatedidentifier/)
   */
  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  readonly relatedIdentifiers?: string[];

  /**
   * JSON object containing the metadata. This will cover most optional fields of the DataCite schema, and will require a mapping from metadata subfields to DataCite Schema definitions.
   */
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;
}

export class PartialUpdatePublishedDataDto extends PartialType(
  UpdatePublishedDataDto,
) {}
