export enum JobsAuth {
  // public, no token required
  All = "#all",
  // Admin user
  Admin = "#admin",
  // Any logged in user
  Authenticated = "#authenticated",
  DatasetPublic = "#datasetPublic",
  // User belongs to dataset's ownerGroup for all `datasetIds`.
  // Equivalent to write access to all datasets in the request
  DatasetOwner = "#datasetOwner",
  // User belongs to ownerGroup, accessGroup, or public dataset
  // Equivalent to read access to all datasets in the request
  DatasetAccess = "#datasetAccess",
}
