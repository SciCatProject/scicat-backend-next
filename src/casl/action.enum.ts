export enum Action {  // Should we call this Operations instead?
  // Dataset actions
  Manage = "manage",
  Create = "create",
  Read = "read",
  ReadOwn = "readown",
  ReadAll = "readall",
  Update = "update",
  Delete = "delete",
  ListOwn = "listown",
  ListAll = "listall",
  // ---------------
  // Datasets
  // endpoint authorization
  DatasetCreate = "dataset_create",
  DatasetRead = "dataset_read",
  DatasetUpdate = "dataset_update",
  DatasetDelete = "dataset_delete",
  DatasetAttachmentCreate = "dataset_attachment_create",
  DatasetAttachmentRead = "dataset_attachment_read",
  DatasetAttachmentUpdate = "dataset_attachment_update",
  DatasetAttachmentDelete = "dataset_attachment_delete",
  DatasetOrigdatablockCreate = "dataset_origdatablock_create",
  DatasetOrigdatablockRead = "dataset_origdatablock_read",
  DatasetOrigdatablockUpdate = "dataset_origdatablock_update",
  DatasetOrigdatablockDelete = "dataset_origdatablock_delete",
  DatasetDatablockCreate = "dataset_datablock_create",
  DatasetDatablockRead = "dataset_datablock_read",
  DatasetDatablockUpdate = "dataset_datablock_update",
  DatasetDatablockDelete = "dataset_datablock_delete",
  DatasetLogbookRead = "dataset_logbook_read",
  // data instance authorization
  DatasetCreateOwnerNoPid = "dataset_create_owner_no_pid",
  DatasetCreateOwnerWithPid = "dataset_create_owner_with_pid",
  DatasetCreateAny = "dataset_create_any",
  DatasetReadManyPublic = "dataset_read_many_public",
  DatasetReadManyAccess = "dataset_read_many_access",
  DatasetReadManyOwner = "dataset_read_many_owner",
  DatasetReadOnePublic = "dataset_read_one_public",
  DatasetReadOneAccess = "dataset_read_one_access",
  DatasetReadOneOwner = "dataset_read_one_owner",
  DatasetReadAny = "dataset_read_any",
  DatasetUpdateOwner = "dataset_update_owner",
  DatasetUpdateAny = "dataset_update_any",
  DatasetDeleteOwner = "dataset_delete_owner",
  DatasetDeleteAny = "dataset_delete_any",
  DatasetAttachmentCreateOwner = "dataset_attachment_create_owner",
  DatasetAttachmentCreateAny = "dataset_attachment_create_any",
  DatasetAttachmentReadPublic = "dataset_attachment_read_public",
  DatasetAttachmentReadAccess = "dataset_attachment_read_access",
  DatasetAttachmentReadOwner = "dataset_attachment_read_owner",
  DatasetAttachmentReadAny = "dataset_attachment_read_any",
  DatasetAttachmentUpdateOwner = "dataset_attachment_update_owner",
  DatasetAttachmentUpdateAny = "dataset_attachment_update_any",
  DatasetAttachmentDeleteOwner = "dataset_attachment_delete_owner",
  DatasetAttachmentDeleteAny = "dataset_attachment_delete_any",
  DatasetOrigdatablockCreateOwner = "dataset_origdatablock_create_owner",
  DatasetOrigdatablockCreateAny = "dataset_origdatablock_create_any",
  DatasetOrigdatablockReadPublic = "dataset_origdatablock_read_public",
  DatasetOrigdatablockReadAccess = "dataset_origdatablock_read_access",
  DatasetOrigdatablockReadOwner = "dataset_origdatablock_read_owner",
  DatasetOrigdatablockReadAny = "dataset_origdatablock_read_any",
  DatasetOrigdatablockUpdateOwner = "dataset_origdatablock_update_owner",
  DatasetOrigdatablockUpdateAny = "dataset_origdatablock_update_any",
  DatasetOrigdatablockDeleteOwner = "dataset_origdatablock_delete_owner",
  DatasetOrigdatablockDeleteAny = "dataset_origdatablock_delete_any",
  DatasetDatablockCreateOwner = "dataset_datablock_create_owner",
  DatasetDatablockCreateAny = "dataset_datablock_create_any",
  DatasetDatablockReadPublic = "dataset_datablock_read_public",
  DatasetDatablockReadAccess = "dataset_datablock_read_access",
  DatasetDatablockReadOwner = "dataset_datablock_read_owner",
  DatasetDatablockReadAny = "dataset_datablock_read_any",
  DatasetDatablockUpdateOwner = "dataset_datablock_update_owner",
  DatasetDatablockUpdateAny = "dataset_datablock_update_any",
  DatasetDatablockDeleteOwner = "dataset_datablock_delete_owner",
  DatasetDatablockDeleteAny = "dataset_datablock_delete_any",
  DatasetLogbookReadOwner = "dataset_logbook_read_owner",
  DatasetLogbookReadAny = "dataset_logbook_read_any",
  // -------------
  // Origdatablock
  // endpoint authorization actions
  OrigdatablockCreate = "origdatablock_create",
  OrigdatablockRead = "origdatablock_read",
  OrigdatablockUpdate = "origdatablock_update",
  OrigdatablockDelete = "origdatablock_delete",
  // individual actions
  OrigdatablockCreateOwner = "origdatablock_create_owner",
  OrigdatablockCreateAny = "origdatablock_create_any",
  OrigdatablockReadManyPublic = "origdatablock_read_many_public",
  OrigdatablockReadManyAccess = "origdatablock_read_many_access",
  OrigdatablockReadManyOwner = "origdatablock_read_many_owner",
  OrigdatablockReadOnePublic = "origdatablock_read_one_public",
  OrigdatablockReadOneAccess = "origdatablock_read_one_access",
  OrigdatablockReadOneOwner = "origdatablock_read_one_owner",
  OrigdatablockReadAny = "origdatablock_read_any",
  OrigdatablockUpdateOwner = "origdatablock_update_owner",
  OrigdatablockUpdateAny = "origdatablock_update_any",
  OrigdatablockDeleteOwner = "origdatablock_delete_owner",
  OrigdatablockDeleteAny = "origdatablock_delete_any",
  // -------------
  // Proposals
  // endpoint authorization actions
  ProposalsCreate = "proposals_create",
  ProposalsRead = "proposals_read",
  ProposalsUpdate = "proposals_update",
  ProposalsDelete = "proposals_delete",
  ProposalsAttachmentCreate = "proposals_attachment_create",
  ProposalsAttachmentRead = "proposals_attachment_read",
  ProposalsAttachmentUpdate = "proposals_attachment_update",
  ProposalsAttachmentDelete = "proposals_attachment_delete",
  ProposalsDatasetRead = "proposals_dataset_read",
  // individual actions
  ProposalsCreateOwner = "proposals_create_owner",
  ProposalsCreateAny = "proposals_create_any",
  ProposalsReadManyPublic = "proposals_read_many_public",
  ProposalsReadManyAccess = "proposals_read_many_access",
  ProposalsReadManyOwner = "proposals_read_many_owner",
  ProposalsReadOnePublic = "proposals_read_one_public",
  ProposalsReadOneAccess = "proposals_read_one_access",
  ProposalsReadOneOwner = "proposals_read_one_owner",
  ProposalsReadAny = "proposals_read_any",
  ProposalsUpdateOwner = "proposals_update_owner",
  ProposalsUpdateAny = "proposals_update_any",
  ProposalsDeleteOwner = "proposals_delete_owner",
  ProposalsDeleteAny = "proposals_delete_any",
  ProposalsAttachmentCreateOwner = "proposals_attachment_create_owner",
  ProposalsAttachmentCreateAny = "proposals_attachment_create_any",
  ProposalsAttachmentReadPublic = "proposals_attachment_read_public",
  ProposalsAttachmentReadAccess = "proposals_attachment_read_access",
  ProposalsAttachmentReadOwner = "proposals_attachment_read_owner",
  ProposalsAttachmentReadAny = "proposals_attachment_read_any",
  ProposalsAttachmentUpdateOwner = "proposals_attachment_update_owner",
  ProposalsAttachmentUpdateAny = "proposals_attachment_update_any",
  ProposalsAttachmentDeleteOwner = "proposals_attachment_delete_owner",
  ProposalsAttachmentDeleteAny = "proposals_attachment_delete_any",
  // -------------
  // Samples
  // endpoint authorization actions
  SamplesCreate = "samples_create",
  SamplesRead = "samples_read",
  SamplesUpdate = "samples_update",
  SamplesDelete = "samples_delete",
  SamplesAttachmentCreate = "samples_attachment_create",
  SamplesAttachmentRead = "samples_attachment_read",
  SamplesAttachmentUpdate = "samples_attachment_update",
  SamplesAttachmentDelete = "samples_attachment_delete",
  SamplesDatasetRead = "samples_dataset_read",
  // individual actions
  SamplesCreateOwner = "samples_create_owner",
  SamplesCreateAny = "samples_create_any",
  SamplesReadManyPublic = "samples_read_many_public",
  SamplesReadManyAccess = "samples_read_many_access",
  SamplesReadManyOwner = "samples_read_many_owner",
  SamplesReadOnePublic = "samples_read_one_public",
  SamplesReadOneAccess = "samples_read_one_access",
  SamplesReadOneOwner = "samples_read_one_owner",
  SamplesReadAny = "samples_read_any",
  SamplesUpdateOwner = "samples_update_owner",
  SamplesUpdateAny = "samples_update_any",
  SamplesDeleteOwner = "samples_delete_owner",
  SamplesDeleteAny = "samples_delete_any",
  SamplesAttachmentCreateOwner = "samples_attachment_create_owner",
  SamplesAttachmentCreateAny = "samples_attachment_create_any",
  SamplesAttachmentReadPublic = "samples_attachment_read_public",
  SamplesAttachmentReadAccess = "samples_attachment_read_access",
  SamplesAttachmentReadOwner = "samples_attachment_read_owner",
  SamplesAttachmentReadAny = "samples_attachment_read_any",
  SamplesAttachmentUpdateOwner = "samples_attachment_update_owner",
  SamplesAttachmentUpdateAny = "samples_attachment_update_any",
  SamplesAttachmentDeleteOwner = "samples_attachment_delete_owner",
  SamplesAttachmentDeleteAny = "samples_attachment_delete_any",
  // --------------
  // Jobs
  // endpoint authorization
  JobsCreate = "jobs_create",
  JobsRead = "jobs_read",
  JobsUpdate = "jobs_update",
  // data instance authorization
  JobsCreateOwner = "jobs_create_owner",
  JobsCreateAny = "jobs_create_any",
  JobsReadAccess = "jobs_read_access",
  JobsReadAny = "jobs_read_any",
  JobsUpdateAccess = "jobs_update_access",
  JobsUpdateAny = "jobs_update_any",
  // -------------
  // Users actions
  UserReadOwn = "user_read_own",
  UserReadAny = "user_read_any",
  UserCreateOwn = "user_create_own",
  UserCreateAny = "user_create_any",
  UserUpdateOwn = "user_update_own",
  UserUpdateAny = "user_update_any",
  UserDeleteOwn = "user_delete_own",
  UserDeleteAny = "user_delete_any",
  UserCreateJwt = "user_create_jwt",
  // -------------
  // Instrument actions
  InstrumentRead = "instrument_read",
  InstrumentUpdate = "instrument_update",
  InstrumentCreate = "instrument_create",
  InstrumentDelete = "instrument_delete",
}
