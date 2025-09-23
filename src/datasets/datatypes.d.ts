import { CreateRawDatasetObsoleteDto } from "./dto/create-raw-dataset-obsolete.dto";
import { CreateDerivedDatasetObsoleteDto } from "./dto/create-derived-dataset-obsolete.dto";
import { CreateDatasetDto } from "./dto/create-dataset.dto";
import {
  PartialUpdateDatasetDto,
  UpdateDatasetDto,
} from "./dto/update-dataset.dto";
import { PartialUpdateRawDatasetObsoleteDto, UpdateRawDatasetObsoleteDto } from "./dto/update-raw-dataset-obsolete.dto";
import {
  PartialUpdateDerivedDatasetObsoleteDto,
  UpdateDerivedDatasetObsoleteDto,
} from "./dto/update-derived-dataset-obsolete.dto";

type DatasetDtoTypes =
  | CreateRawDatasetObsoleteDto
  | CreateDerivedDatasetObsoleteDto
  | CreateDatasetDto
  | PartialUpdateRawDatasetObsoleteDto
  | PartialUpdateDerivedDatasetObsoleteDto
  | PartialUpdateDatasetDto
  | UpdateRawDatasetObsoleteDto
  | UpdateDerivedDatasetObsoleteDto
  | UpdateDatasetDto;

type CreateDatasetType =
  | CreateRawDatasetObsoleteDto
  | CreateDerivedDatasetObsoleteDto
  | CreateDatasetDto;

type ConvertedDatasetOutputType =
  | CreateDatasetDto
  | UpdateDatasetDto
  | PartialUpdateDatasetDto;

type ConvertedDatasetInputType =
  | CreateRawDatasetObsoleteDto
  | CreateDerivedDatasetObsoleteDto
  | CreateDatasetDto
  | UpdateRawDatasetObsoleteDto
  | UpdateDerivedDatasetObsoleteDto
  | UpdateDatasetDto
  | PartialUpdateRawDatasetObsoleteDto
  | PartialUpdateDerivedDatasetObsoleteDto
  | PartialUpdateDatasetDto;
