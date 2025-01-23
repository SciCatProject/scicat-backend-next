export enum CreateJobAuth {
  // public, no token required
  All = "#all",
  // any user can access public datasets
  DatasetPublic = "#datasetPublic",
  // Any logged in user
  Authenticated = "#authenticated",
  // User belongs to ownerGroup, accessGroup, or public dataset
  // Equivalent to read access to all datasets in the request
  DatasetAccess = "#datasetAccess",
  // User belongs to dataset's ownerGroup for all `datasetIds`.
  // Equivalent to write access to all datasets in the request
  DatasetOwner = "#datasetOwner",
}

export enum UpdateJobAuth {
  // any user can update, no checks are performed
  // to be used carefully, mainly for testing
  All = "#all",
  // only user owner can update the job
  // see field ownerUser
  JobOwnerUser = "#jobOwnerUser",
  // only users belonging to the owner group can update the job
  // see field ownerGroup
  JobOwnerGroup = "#jobOwnerGroup",
}

export type JobsAuth = CreateJobAuth | UpdateJobAuth;
