import { Lifecycle } from '../schemas/lifecycle.schema';
import { Technique } from '../schemas/technique.schema';

export class CreateDatasetDto {
  readonly owner: string;
  readonly ownerEmail: string;
  readonly orcidOfOwner: string;
  readonly contactEmail: string;
  readonly sourceFolder: string;
  readonly sourceFolderHost: string;
  readonly size: number;
  readonly packedSize: number;
  readonly numberOfFiles: number;
  readonly numberOfFilesArchived: number;
  readonly creationTime: Date;
  readonly type: string;
  readonly validationStatus: string;
  readonly keywords: string[];
  readonly description: string;
  readonly datasetName: string;
  readonly classification: string;
  readonly license: string;
  readonly version: string;
  readonly isPublished: boolean;
  readonly ownerGroup: string;
  readonly accessGroups: string[];
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly history: any[];
  readonly datasetlifecycle: Lifecycle;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly instrumentId: string;
  readonly techniques: Technique[];
}
