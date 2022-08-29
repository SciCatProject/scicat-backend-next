| RawDataset.js | RawDatasets | adds a new proposal | post | /api/v3/Proposals |
| RawDataset.js | RawDatasets | adds a new raw dataset | post | /api/v3/Datasets |
| RawDataset.js | RawDatasets | should fetch several raw datasets | get | /api/v3/Datasets |
| RawDataset.js | RawDatasets | should fetch this raw dataset | get | /api/v3/Datasets/findOne |
| RawDataset.js | RawDatasets | should delete this raw dataset | delete | /api/v3/datasets/_datasetPid_ |
| RawDataset.js | RawDatasets | should contain an array of facets | get | /api/v3/datasets/fullfacet |
| RawDataset.js | RawDatasets | should delete this proposal | delete | /api/v3/Proposals/_proposalId_ |
| Policy.js | Simple Policy tests | adds a new policy | post | /api/v3/Policies |
| Policy.js | Simple Policy tests | should fetch this new policy | get | /api/v3/Policies/_id_ |
| Policy.js | Simple Policy tests | updates this existing policy | patch | /api/v3/Policies/_id_ |
| Policy.js | Simple Policy tests | should delete this policy | delete | /api/v3/Policies/_id_ |
| DatasetLifecycle.js | Test facet and filter queries | adds a new raw dataset | post | /api/v3/Datasets |
| DatasetLifecycle.js | Test facet and filter queries | adds another new raw dataset | post | /api/v3/Datasets |
| DatasetLifecycle.js | Test facet and filter queries | Should return datasets with complex join query fulfilled | get | /api/v3/Datasets/fullquery |
| DatasetLifecycle.js | Test facet and filter queries | Should return datasets with ordered results | get | /api/v3/RawDatasets/fullquery |
| DatasetLifecycle.js | Test facet and filter queries | Should return no datasets, because number of hits exhausted | get | /api/v3/Datasets/fullquery |
| DatasetLifecycle.js | Test facet and filter queries | Should return facets with complex join query fulfilled | get | /api/v3/Datasets/fullfacet |
| DatasetLifecycle.js | Test facet and filter queries | Should update archive status message from archiveManager account | put | /api/v3/Datasets/_datasetPid_ |
| DatasetLifecycle.js | Test facet and filter queries | Should update the datasetLifecycle information for multiple datasets | put | /api/v3/Datasets/ |
| DatasetLifecycle.js | Test facet and filter queries | The history status should now include the last change for the first raw dataset | get | /api/v3/Datasets/_datasetPid_ |
| DatasetLifecycle.js | Test facet and filter queries | The history status should now include the last change for second raw dataset | get | /api/v3/Datasets/_datasetPid_ |
| DatasetLifecycle.js | Test facet and filter queries | Should update the datasetLifecycle information directly via embedded model API | put | /api/v3/Datasets/_datasetPid_/datasetLifecycle |
| DatasetLifecycle.js | Test facet and filter queries | Should reset the embedded DatasetLifecycle status and delete Datablocks | put | /api/v3/Datasets/resetArchiveStatus |
| DatasetLifecycle.js | Test facet and filter queries | should delete the newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| DatasetLifecycle.js | Test facet and filter queries | should delete the newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| LoginUtils.js | unknown | unknown | post | /api/v3/Users/Login |
| LoginUtils.js | unknown | unknown | post | /auth/msad |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a new raw dataset | post | /api/v3/Datasets |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a new origDatablock | post | /api/v3/datasets/_datasetPid_/OrigDatablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a new origDatablock | delete | /api/v3/Datablocks/_origDatablockId_ |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | remove potentially existing datablocks to guarantee uniqueness | get | /api/v3/datasets/_datasetPid_/Datablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a new datablock | post | /api/v3/datasets/_datasetPid_/Datablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a new datablock again which should fail because it is already stored | post | /api/v3/datasets/_datasetPid_/Datablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a new datablock which should fail because wrong functional account | post | /api/v3/datasets/_datasetPid_/Datablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | adds a second datablock for same dataset | post | /api/v3/datasets/_datasetPid_/Datablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | Should fetch all datablocks belonging to the new dataset | get | /api/v3/Datasets/_datasetPid_/datablocks |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | should fetch one dataset including related data | get | /api/v3/Datasets/findOne |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | Should fetch some filenames from the new dataset | get | /api/v3/OrigDatablocks/findFilesByName |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | Should fetch some filenames using regexp from the new dataset | get | /api/v3/OrigDatablocks/findFilesByName |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | Should fetch some filenames without dataset condition | get | /api/v3/OrigDatablocks/findFilesByName |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | The size and numFiles fields in the dataset should be correctly updated | get | /api/v3/Datasets/_datasetPid_ |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | should delete a datablock | delete | /api/v3/datasets/_datasetPid_/Datablocks/_datablockId_ |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | should delete a OrigDatablock | delete | /api/v3/datasets/_datasetPid_/OrigDatablocks/_origDatablockId_ |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | should delete the 2nd datablock | delete | /api/v3/datasets/_datasetPid_/Datablocks/_datablockId_ |
| Datablock.js | Test Datablocks and OrigDatablocks and their relation to raw Datasets | should delete the newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| Sample.js | Simple Sample tests | adds a new sample | post | /api/v3/Samples |
| Sample.js | Simple Sample tests | should fetch this new sample | get | /api/v3/Samples/_sampleId_ |
| Sample.js | Simple Sample tests | should add a new attachment to this sample | post | /api/v3/Samples/_sampleId_/attachments |
| Sample.js | Simple Sample tests | should fetch this sample attachment | get | /api/v3/Samples/_sampleId_/attachments/_attachmentId_ |
| Sample.js | Simple Sample tests | should delete this sample attachment | delete | /api/v3/Samples/_sampleId_/attachments/_attachmentId_ |
| Sample.js | Simple Sample tests | should delete this sample | delete | /api/v3/Samples/_sampleId_ |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should retrieve existing Datablocks with specific archiveId, if any | get | /api/v3/datasets//Datablocks |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should retrieve existing Datablocks with 2nd specific archiveId, if any | get | /api/v3/Datablocks |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should delete existing Datablocks (usually none) with specific archiveId | delete | /api/v3/Datablocks/_foundId1_ |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should delete existing Datablocks (usually none) with 2nd specific archiveId | delete | /api/v3/Datablocks/_foundId2_ |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | adds a new raw dataset | post | /api/v3/RawDatasets |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | adds a new datablock | post | /api/v3/Datablocks |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | adds a second datablock for same dataset | post | /api/v3/Datablocks |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | Should fetch all datablocks belonging to the new dataset | get | /api/v3/Datasets/_datasetPid_ |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should reset the archive information from the newly created dataset | put | /api/v3/Datasets/resetArchiveStatus |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | The archive Status Message should now be reset | get | /api/v3/Datasets/_datasetPid_ |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | There should be no datablocks any more for this dataset | get | /api/v3/Datasets/_datasetPid_/datablocks/count |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should check createdBy and updatedBy fields of the newly created dataset | get | /api/v3/Datasets/_datasetPid_ |
| ResetDataset.js | Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status | should delete the newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| DerivedDataset.js | DerivedDatasets | adds a new derived dataset | post | /api/v3/Datasets |
| DerivedDataset.js | DerivedDatasets | should fetch one derived dataset | get | /api/v3/datasets/findOne |
| DerivedDataset.js | DerivedDatasets | should delete a derived dataset | delete | /api/v3/Datasets/_datasetPid_ |
| DerivedDataset.js | DerivedDatasets | should fetch all derived datasets | get | /api/v3/Datasets |
| DerivedDataset.js | DerivedDatasets | should contain an array of facets | get | /api/v3/Datasets |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should get count of datasets | get | /api/v3/Datasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should get count of raw datasets | get | /api/v3/RawDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should get count of derived datasets | get | /api/v3/DerivedDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | check if raw dataset is valid | post | /api/v3/RawDatasets/isValid |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | check if wrong data is recognized as invalid | post | /api/v3/RawDatasets/isValid |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | adds a new dataset | post | /api/v3/Datasets |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | check for correct new count of datasets | get | /api/v3/Datasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | check for unchanged count of raw datasets | get | /api/v3/RawDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | check for unchanged count of derived datasets | get | /api/v3/DerivedDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should add a new raw dataset | post | /api/v3/Datasets |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new dataset count should be incremented | get | /api/v3/Datasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new raw dataset count should be incremented | get | /api/v3/RawDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new derived dataset count should be unchanged | get | /api/v3/DerivedDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | adds a new derived dataset | post | /api/v3/Datasets |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new dataset count should be incremented | get | /api/v3/Datasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new raw dataset count should be unchanged | get | /api/v3/RawDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new derived dataset count should be incremented | get | /api/v3/DerivedDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should delete the created new dataset | delete | /api/v3/Datasets/_datasetPid_ |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should delete the created new raw dataset | delete | /api/v3/Datasets/_datasetPid_ |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | should delete the created new derived dataset | delete | /api/v3/Datasets/_datasetPid_ |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new dataset count should be back to old count | get | /api/v3/Datasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new raw dataset count should be back to old count | get | /api/v3/RawDatasets/count |
| CheckDifferentDatasetTypes.js | Check different dataset types and their inheritance | new derived dataset count should be back to old count | get | /api/v3/DerivedDatasets/count |
| Proposal.js | Simple Proposal tests | unknown | delete | /api/v3/Proposals/_proposalId_ |
| Proposal.js | Simple Proposal tests | remove potentially existing proposals to guarantee uniqueness | get | /api/v3/Proposals |
| Proposal.js | Simple Proposal tests | adds a new proposal | post | /api/v3/Proposals |
| Proposal.js | Simple Proposal tests | should fetch this new proposal | get | /api/v3/Proposals/_proposalId_ |
| Proposal.js | Simple Proposal tests | should add a new attachment to this proposal | post | /api/v3/Proposals/_proposalId_/attachments |
| Proposal.js | Simple Proposal tests | should fetch this proposal attachment | get | /api/v3/Proposals/_proposalId_/attachments |
| Proposal.js | Simple Proposal tests | should delete this proposal attachment | delete | /api/v3/Proposals/_proposalId_/attachments/_attachmentId_ |
| Proposal.js | Simple Proposal tests | should delete this proposal | delete | /api/v3/Proposals/_proposalId_ |
| Jobs.js | Test New Job Model | adds a new raw dataset | post | /api/v3/Datasets |
| Jobs.js | Test New Job Model | adds another new raw dataset | post | /api/v3/Datasets |
| Jobs.js | Test New Job Model | Adds a new archive job request without authentication, which should fails | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Adds a new archive job request | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Adds a new archive job request contains empty datasetList, which should fail | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Adds a new archive job request on non exist dataset which should fail | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Check if dataset 1 was updated by job request | get | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Check if dataset 2 was updated by job request | get | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Create retrieve job request on same dataset, which should fail as well because not yet retrievable | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Send an update status to dataset 1, simulating the archive system response | put | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Send an update status to dataset 2, simulating the archive system response | put | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Disable notification bt email | post | /api/v3/Policies/updatewhere |
| Jobs.js | Test New Job Model | Adds a new archive job request for same data which should fail | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Send an update status to the archive job request, signal successful archiving | put | /api/v3/Jobs/_archiveJobId_ |
| Jobs.js | Test New Job Model | Adds a new retrieve job request on same dataset, which should succeed now | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Read contents of dataset 1 after retrieve job and make sure that still retrievable | get | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Send an update status to the dataset | put | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Send an update status to the dataset, simulating the archive system response of finished job with partial failure | put | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Send an update status message to the Job | put | /api/v3/Jobs/_retrieveJobId_ |
| Jobs.js | Test New Job Model | Send an update status to the datasets, simulating the archive system response of successful job | post | /api/v3/Datasets/update |
| Jobs.js | Test New Job Model | Send an update status message to the Job | put | /api/v3/Jobs/_retrieveJobId_ |
| Jobs.js | Test New Job Model | Bulk update Job status prepare to trigger sending email mechanism | post | /api/v3/Jobs/update |
| Jobs.js | Test New Job Model | Bulk update Job status, should send out email | post | /api/v3/Jobs/update |
| Jobs.js | Test New Job Model | adds a new origDatablock | post | /api/v3/OrigDatablocks |
| Jobs.js | Test New Job Model | Adds a new public job request on private datasets, which should fails | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Set to true for one of the dataset | put | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | Adds a new public job request on one public and one private dataset, which should fails | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Update isPublished to true on both datasets | post | /api/v3/Datasets/update |
| Jobs.js | Test New Job Model | Adds a new public job request without authentication | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Adds a new public job request with authentication | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Send an update status to the public job request, signal finished job with partial failure | put | /api/v3/Jobs/_publicJobIds[0]_ |
| Jobs.js | Test New Job Model | Adds a new public job request to download some selected files | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | Send an update status to the public job request, signal successful job | put | /api/v3/Jobs/_publicJobIds[1]_ |
| Jobs.js | Test New Job Model | Add new job using put, which should fails. Ensure that adding new job without authentication using put is not possible  | put | /api/v3/Jobs/ |
| Jobs.js | Test New Job Model | Adds a new public job request with to download some selected files that dont exist, which should fail | post | /api/v3/Jobs |
| Jobs.js | Test New Job Model | should delete the archive Job | delete | /api/v3/Jobs/_archiveJobId_ |
| Jobs.js | Test New Job Model | should delete the retrieve Job | delete | /api/v3/Jobs/_retrieveJobId_ |
| Jobs.js | Test New Job Model | should delete the retrieve Job | delete | /api/v3/Jobs/_jobId_ |
| Jobs.js | Test New Job Model | should delete the originDataBlock | delete | /api/v3/datasets/_datasetPid_/OrigDatablocks/_origDatablockId_ |
| Jobs.js | Test New Job Model | should delete the newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| Jobs.js | Test New Job Model | should delete the second newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a new derived dataset | post | /api/v3/Datasets |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a new origDatablock | post | /api/v3/datasets/_datasetPid_/OrigDatablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a new origDatablock | delete | /api/v3/Datablocks/_origDatablockId_ |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | remove potentially existing datablocks to guarantee uniqueness | get | /api/v3/Datasets/_datasetPid_/Datablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a new datablock | post | /api/v3/datasets/_datasetPid_/Datablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a new datablock again which should fail because it is already stored | post | /api/v3/datasets/_datasetPid_/Datablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a new datablock which should fail because wrong functional account | post | /api/v3/datasets/_datasetPid_/Datablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | adds a second datablock for same dataset | post | /api/v3/datasets/_datasetPid_/Datablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | Should fetch all datablocks belonging to the new dataset | get | /api/v3/Datasets/_datasetPid_/datablocks |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | The size fields in the dataset should be correctly updated | get | /api/v3/Datasets/_datasetPid_ |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | should delete a datablock | delete | /api/v3/datasets/_datasetPid_/Datablocks/_datablockId_ |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | should delete a OrigDatablock | delete | /api/v3/datasets/_datasetPid_/OrigDatablocks/_origDatablockId_ |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | should delete the 2nd datablock | delete | /api/v3/datasets/_datasetPid_/Datablocks/_datablockId_ |
| DatablockDerived.js | Test Datablocks and OrigDatablocks and their relation to Derived Datasets | should delete the newly created dataset | delete | /api/v3/Datasets/_datasetPid_ |
| PublishedData.js | Test of access to published data | adds a published data | post | /api/v3/PublishedData |
| PublishedData.js | Test of access to published data | should fetch this new published data | get | /api/v3/PublishedData/_doi_ |
| PublishedData.js | Test of access to published data | should register this new published data | post | /api/v3/PublishedData/_doi_/register |
| PublishedData.js | Test of access to published data | should register this new published data | post | /api/v3/PublishedData/_doi_/register/ |
| PublishedData.js | Test of access to published data | should fetch this new published data | get | /api/v3/PublishedData/_doi_ |
| PublishedData.js | Test of access to published data | should resync this new published data | post | /api/v3/PublishedData/_doi_/resync |
| PublishedData.js | Test of access to published data | should fetch this new published data | get | /api/v3/PublishedData/_doi_ |
| PublishedData.js | Test of access to published data | adds a new dataset | post | /api/v3/Datasets |
| PublishedData.js | Test of access to published data | adds a new nonpublic dataset | post | /api/v3/Datasets |
| PublishedData.js | Test of access to published data | should create one publisheddata to dataset relation | put | /api/v3/PublishedData/_doi_/datasets/rel/_datasetPid_ |
| PublishedData.js | Test of access to published data | should fetch publisheddata with non empty dataset relation | get | /api/v3/PublishedData/_doi_ |
| PublishedData.js | Test of access to published data | should delete this published data | delete | /api/v3/PublishedData/_doi_ |
| PublishedData.js | Test of access to published data | should fetch this new dataset | get | /api/v3/Datasets/_datasetPid_ |
| PublishedData.js | Test of access to published data | should fetch the non public dataset as ingestor | get | /api/v3/Datasets/_pidnonpublic_ |
| PublishedData.js | Test of access to published data | adds a new origDatablock | post | /api/v3/OrigDatablocks |
| PublishedData.js | Test of access to published data | should add a new attachment to this dataset | post | /api/v3/Datasets/_datasetPid_/attachments |
| PublishedData.js | Test of access to published data | should fetch this dataset attachment | get | /api/v3/Datasets/_datasetPid_/attachments/_attachmentId_ |
| PublishedData.js | Test of access to published data | should fetch some published datasets anonymously | get | /api/v3/Datasets/fullquery |
| PublishedData.js | Test of access to published data | should fail to fetch non-public dataset anonymously | get | /api/v3/Datasets/fullquery |
| PublishedData.js | Test of access to published data | should fetch one dataset including related data anonymously | get | /api/v3/Datasets/findOne |
| PublishedData.js | Test of access to published data | should delete this dataset attachment | delete | /api/v3/Datasets/_datasetPid_/attachments/_attachmentId_ |
| PublishedData.js | Test of access to published data | should delete a OrigDatablock | delete | /api/v3/OrigDatablocks/_origDatablockId_ |
| PublishedData.js | Test of access to published data | should delete the nonpublic dataset | delete | /api/v3/Datasets/_pidnonpublic_ |
| PublishedData.js | Test of access to published data | should delete this dataset | delete | /api/v3/Datasets/_datasetPid_ |
| Dataset.js | Simple Dataset tests | adds a new dataset | post | /api/v3/Datasets |
| Dataset.js | Simple Dataset tests | should fetch this new dataset | get | /api/v3/Datasets/_datasetPid_ |
| Dataset.js | Simple Dataset tests | should fail fetching this new dataset | get | /api/v3/Datasets/_datasetPid_ |
| Dataset.js | Simple Dataset tests | should add a new attachment to this dataset | post | /api/v3/Datasets/_datasetPid_/attachments |
| Dataset.js | Simple Dataset tests | should fetch this dataset attachment | get | /api/v3/Datasets/_datasetPid_/attachments |
| Dataset.js | Simple Dataset tests | should delete this dataset attachment | delete | /api/v3/Datasets/_datasetPid_/attachments/_attachmentId_ |
| Dataset.js | Simple Dataset tests | fetches Datasets filtered by datasetName | get | /api/v3/Datasets |
| Dataset.js | Simple Dataset tests | should delete this dataset | delete | /api/v3/Datasets/_datasetPid_ |
| Dataset.js | Simple Dataset tests | fetches array of Datasets | get | /api/v3/Datasets |
| Dataset.js | Simple Dataset tests | should contain an array of facets | get | /api/v3/Datasets/fullfacet |
| Dataset.js | Simple Dataset tests | should fetch a filtered array of datasets | get | /api/v3/Datasets/fullquery |
| Dataset.js | Simple Dataset tests | should fail creating a dataset with non unique techniques | post | /api/v3/Datasets |
| Users.js | Login with functional accounts | Ingestor login fails with incorrect credentials | post | /api/v3/Users/Login |
| Users.js | Login with functional accounts | Login should succeed with correct credentials | post | /api/v3/Users/Login |
