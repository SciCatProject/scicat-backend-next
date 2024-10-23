export enum JobType {
  Archive = "archive",
  Retrieve = "retrieve",
  Public = "public",
}

export enum DatasetState {
  retrieve = "retrievable",
  archive = "archivable",
  public = "isPublished",
}

export enum JobParams {
  DatasetList = "datasetList",
  Pid = "pid",
  Files = "files",
}
