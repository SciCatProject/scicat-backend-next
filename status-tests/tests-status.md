| Section | Test | Status  |
|:-------:|:----:|:-------:|
|  Check different dataset types and their inheritance  |  should get count of datasets  |  *Passed*  |
|  Check different dataset types and their inheritance  |  should get count of raw datasets  |  __Failed__  |
|  Check different dataset types and their inheritance  |  should get count of derived datasets  |  __Failed__  |
|  Check different dataset types and their inheritance  |  check if raw dataset is valid  |  __Failed__  |
|  Check different dataset types and their inheritance  |  check if wrong data is recognized as invalid  |  __Failed__  |
|  Check different dataset types and their inheritance  |  adds a new dataset  |  __Failed__  |
|  Check different dataset types and their inheritance  |  check for correct new count of datasets  |  __Failed__  |
|  Check different dataset types and their inheritance  |  check for unchanged count of raw datasets  |  __Failed__  |
|  Check different dataset types and their inheritance  |  check for unchanged count of derived datasets  |  __Failed__  |
|  Check different dataset types and their inheritance  |  should add a new raw dataset  |  *Passed*  |
|  Check different dataset types and their inheritance  |  new dataset count should be incremented  |  __Failed__  |
|  Check different dataset types and their inheritance  |  new raw dataset count should be incremented  |  __Failed__  |
|  Check different dataset types and their inheritance  |  new derived dataset count should be unchanged  |  __Failed__  |
|  Check different dataset types and their inheritance  |  adds a new derived dataset  |  *Passed*  |
|  Check different dataset types and their inheritance  |  new dataset count should be incremented  |  __Failed__  |
|  Check different dataset types and their inheritance  |  new raw dataset count should be unchanged  |  __Failed__  |
|  Check different dataset types and their inheritance  |  new derived dataset count should be incremented  |  __Failed__  |
|  Check different dataset types and their inheritance  |  should delete the created new dataset  |  __Failed__  |
|  Check different dataset types and their inheritance  |  should delete the created new raw dataset  |  *Passed*  |
|  Check different dataset types and their inheritance  |  should delete the created new derived dataset  |  *Passed*  |
|  Check different dataset types and their inheritance  |  new dataset count should be back to old count  |  *Passed*  |
|  Check different dataset types and their inheritance  |  new raw dataset count should be back to old count  |  __Failed__  |
|  Check different dataset types and their inheritance  |  new derived dataset count should be back to old count  |  __Failed__  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  adds a new raw dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  adds a new origDatablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  remove potentially existing datablocks to guarantee uniqueness  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  adds a new datablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  adds a new datablock again which should fail because it is already stored  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  adds a new datablock which should fail because wrong functional account  |  __Failed__  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  adds a second datablock for same dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  Should fetch all datablocks belonging to the new dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  should fetch one dataset including related data  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  Should fetch some filenames from the new dataset  |  __Failed__  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  Should fetch some filenames using regexp from the new dataset  |  __Failed__  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  Should fetch some filenames without dataset condition  |  __Failed__  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  The size and numFiles fields in the dataset should be correctly updated  |  __Failed__  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  should delete a datablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  should delete a OrigDatablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  should delete the 2nd datablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to raw Datasets  |  should delete the newly created dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  adds a new derived dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  adds a new origDatablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  remove potentially existing datablocks to guarantee uniqueness  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  adds a new datablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  adds a new datablock again which should fail because it is already stored  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  adds a new datablock which should fail because wrong functional account  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  adds a second datablock for same dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  Should fetch all datablocks belonging to the new dataset  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  The size fields in the dataset should be correctly updated  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  should delete a datablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  should delete a OrigDatablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  should delete the 2nd datablock  |  *Passed*  |
|  Test Datablocks and OrigDatablocks and their relation to Derived Datasets  |  should delete the newly created dataset  |  *Passed*  |
|  Simple Dataset tests  |  adds a new dataset  |  __Failed__  |
|  Simple Dataset tests  |  should fetch this new dataset  |  __Failed__  |
|  Simple Dataset tests  |  should fail fetching this new dataset  |  *Passed*  |
|  Simple Dataset tests  |  should add a new attachment to this dataset  |  __Failed__  |
|  Simple Dataset tests  |  should fetch this dataset attachment  |  __Failed__  |
|  Simple Dataset tests  |  should delete this dataset attachment  |  *Passed*  |
|  Simple Dataset tests  |  fetches Datasets filtered by datasetName  |  __Failed__  |
|  Simple Dataset tests  |  should delete this dataset  |  __Failed__  |
|  Simple Dataset tests  |  fetches array of Datasets  |  *Passed*  |
|  Simple Dataset tests  |  should contain an array of facets  |  *Passed*  |
|  Simple Dataset tests  |  should fetch a filtered array of datasets  |  *Passed*  |
|  Simple Dataset tests  |  should fail creating a dataset with non unique techniques  |  __Failed__  |
|  Test facet and filter queries  |  adds a new raw dataset  |  *Passed*  |
|  Test facet and filter queries  |  adds another new raw dataset  |  *Passed*  |
|  Test facet and filter queries  |  Should return datasets with complex join query fulfilled  |  __Failed__  |
|  Test facet and filter queries  |  Should return datasets with ordered results  |  __Failed__  |
|  Test facet and filter queries  |  Should return no datasets, because number of hits exhausted  |  *Passed*  |
|  Test facet and filter queries  |  Should return facets with complex join query fulfilled  |  *Passed*  |
|  Test facet and filter queries  |  Should update archive status message from archiveManager account  |  __Failed__  |
|  Test facet and filter queries  |  Should update the datasetLifecycle information for multiple datasets  |  __Failed__  |
|  Test facet and filter queries  |  The history status should now include the last change for the first raw dataset  |  __Failed__  |
|  Test facet and filter queries  |  The history status should now include the last change for second raw dataset  |  __Failed__  |
|  Test facet and filter queries  |  Should update the datasetLifecycle information directly via embedded model API  |  __Failed__  |
|  Test facet and filter queries  |  Should reset the embedded DatasetLifecycle status and delete Datablocks  |  __Failed__  |
|  Test facet and filter queries  |  should delete the newly created dataset  |  *Passed*  |
|  Test facet and filter queries  |  should delete the newly created dataset  |  *Passed*  |
|  DerivedDatasets  |  adds a new derived dataset  |  *Passed*  |
|  DerivedDatasets  |  should fetch one derived dataset  |  *Passed*  |
|  DerivedDatasets  |  should delete a derived dataset  |  *Passed*  |
|  DerivedDatasets  |  should fetch all derived datasets  |  *Passed*  |
|  DerivedDatasets  |  should contain an array of facets  |  *Passed*  |
|  Test New Job Model  |  adds a new raw dataset  |  *Passed*  |
|  Test New Job Model  |  adds another new raw dataset  |  *Passed*  |
|  Test New Job Model  |  Adds a new archive job request without authentication, which should fails  |  *Passed*  |
|  Test New Job Model  |  Adds a new archive job request  |  *Passed*  |
|  Test New Job Model  |  Adds a new archive job request contains empty datasetList, which should fail  |  __Failed__  |
|  Test New Job Model  |  Adds a new archive job request on non exist dataset which should fail  |  __Failed__  |
|  Test New Job Model  |  Check if dataset 1 was updated by job request  |  __Failed__  |
|  Test New Job Model  |  Check if dataset 2 was updated by job request  |  __Failed__  |
|  Test New Job Model  |  Create retrieve job request on same dataset, which should fail as well because not yet retrievable  |  __Failed__  |
|  Test New Job Model  |  Send an update status to dataset 1, simulating the archive system response  |  __Failed__  |
|  Test New Job Model  |  Send an update status to dataset 2, simulating the archive system response  |  __Failed__  |
|  Test New Job Model  |  Disable notification bt email  |  __Failed__  |
|  Test New Job Model  |  Adds a new archive job request for same data which should fail  |  __Failed__  |
|  Test New Job Model  |  Send an update status to the archive job request, signal successful archiving  |  __Failed__  |
|  Test New Job Model  |  Adds a new retrieve job request on same dataset, which should succeed now  |  __Failed__  |
|  Test New Job Model  |  Read contents of dataset 1 after retrieve job and make sure that still retrievable  |  __Failed__  |
|  Test New Job Model  |  Send an update status to the dataset  |  __Failed__  |
|  Test New Job Model  |  Send an update status to the dataset, simulating the archive system response of finished job with partial failure  |  __Failed__  |
|  Test New Job Model  |  Send an update status message to the Job  |  __Failed__  |
|  Test New Job Model  |  Send an update status to the datasets, simulating the archive system response of successful job  |  __Failed__  |
|  Test New Job Model  |  Send an update status message to the Job  |  __Failed__  |
|  Test New Job Model  |  Bulk update Job status prepare to trigger sending email mechanism  |  __Failed__  |
|  Test New Job Model  |  Bulk update Job status, should send out email  |  __Failed__  |
|  Test New Job Model  |  adds a new origDatablock  |  __Failed__  |
|  Test New Job Model  |  Adds a new public job request on private datasets, which should fails  |  __Failed__  |
|  Test New Job Model  |  Set to true for one of the dataset  |  __Failed__  |
|  Test New Job Model  |  Adds a new public job request on one public and one private dataset, which should fails  |  __Failed__  |
|  Test New Job Model  |  Update isPublished to true on both datasets  |  __Failed__  |
|  Test New Job Model  |  Adds a new public job request without authentication  |  __Failed__  |
|  Test New Job Model  |  Adds a new public job request with authentication  |  __Failed__  |
|  Test New Job Model  |  Send an update status to the public job request, signal finished job with partial failure  |  __Failed__  |
|  Test New Job Model  |  Adds a new public job request to download some selected files  |  __Failed__  |
|  Test New Job Model  |  Send an update status to the public job request, signal successful job  |  __Failed__  |
|  Test New Job Model  |  Add new job using put, which should fails. Ensure that adding new job without authentication using put is not possible  |  __Failed__  |
|  Test New Job Model  |  Adds a new public job request with to download some selected files that dont exist, which should fail  |  __Failed__  |
|  Test New Job Model  |  should delete the archive Job  |  *Passed*  |
|  Test New Job Model  |  should delete the retrieve Job  |  *Passed*  |
|  Test New Job Model  |  should delete the originDataBlock  |  *Passed*  |
|  Test New Job Model  |  should delete the newly created dataset  |  *Passed*  |
|  Test New Job Model  |  should delete the second newly created dataset  |  *Passed*  |
|  Simple Policy tests  |  adds a new policy  |  *Passed*  |
|  Simple Policy tests  |  should fetch this new policy  |  *Passed*  |
|  Simple Policy tests  |  updates this existing policy  |  *Passed*  |
|  Simple Policy tests  |  should delete this policy  |  *Passed*  |
|  Simple Proposal tests  |  remove potentially existing proposals to guarantee uniqueness  |  *Passed*  |
|  Simple Proposal tests  |  adds a new proposal  |  *Passed*  |
|  Simple Proposal tests  |  should fetch this new proposal  |  *Passed*  |
|  Simple Proposal tests  |  should add a new attachment to this proposal  |  *Passed*  |
|  Simple Proposal tests  |  should fetch this proposal attachment  |  *Passed*  |
|  Simple Proposal tests  |  should delete this proposal attachment  |  *Passed*  |
|  Simple Proposal tests  |  should delete this proposal  |  *Passed*  |
|  Test of access to published data  |  adds a published data  |  __Failed__  |
|  Test of access to published data  |  should fetch this new published data  |  __Failed__  |
|  Test of access to published data  |  should register this new published data  |  __Failed__  |
|  Test of access to published data  |  should register this new published data  |  __Failed__  |
|  Test of access to published data  |  should fetch this new published data  |  __Failed__  |
|  Test of access to published data  |  should resync this new published data  |  __Failed__  |
|  Test of access to published data  |  should fetch this new published data  |  __Failed__  |
|  Test of access to published data  |  adds a new dataset  |  __Failed__  |
|  Test of access to published data  |  adds a new nonpublic dataset  |  __Failed__  |
|  Test of access to published data  |  should create one publisheddata to dataset relation  |  __Failed__  |
|  Test of access to published data  |  should fetch publisheddata with non empty dataset relation  |  __Failed__  |
|  Test of access to published data  |  should delete this published data  |  __Failed__  |
|  Test of access to published data  |  should fetch this new dataset  |  __Failed__  |
|  Test of access to published data  |  should fetch the non public dataset as ingestor  |  __Failed__  |
|  Test of access to published data  |  adds a new origDatablock  |  __Failed__  |
|  Test of access to published data  |  should add a new attachment to this dataset  |  __Failed__  |
|  Test of access to published data  |  should fetch this dataset attachment  |  __Failed__  |
|  Test of access to published data  |  should fetch some published datasets anonymously  |  __Failed__  |
|  Test of access to published data  |  should fail to fetch non-public dataset anonymously  |  *Passed*  |
|  Test of access to published data  |  should fetch one dataset including related data anonymously  |  __Failed__  |
|  Test of access to published data  |  should delete this dataset attachment  |  __Failed__  |
|  Test of access to published data  |  should delete a OrigDatablock  |  __Failed__  |
|  Test of access to published data  |  should delete the nonpublic dataset  |  __Failed__  |
|  Test of access to published data  |  should delete this dataset  |  __Failed__  |
|  RawDatasets  |  adds a new proposal  |  *Passed*  |
|  RawDatasets  |  adds a new raw dataset  |  *Passed*  |
|  RawDatasets  |  should fetch several raw datasets  |  *Passed*  |
|  RawDatasets  |  should fetch this raw dataset  |  *Passed*  |
|  RawDatasets  |  should delete this raw dataset  |  *Passed*  |
|  RawDatasets  |  should contain an array of facets  |  *Passed*  |
|  RawDatasets  |  should delete this proposal  |  *Passed*  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should retrieve existing Datablocks with specific archiveId, if any  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should retrieve existing Datablocks with 2nd specific archiveId, if any  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should delete existing Datablocks (usually none) with specific archiveId  |  *Passed*  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should delete existing Datablocks (usually none) with 2nd specific archiveId  |  *Passed*  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  adds a new raw dataset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  adds a new datablock  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  adds a second datablock for same dataset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  Should fetch all datablocks belonging to the new dataset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should reset the archive information from the newly created dataset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  The archive Status Message should now be reset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  There should be no datablocks any more for this dataset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should check createdBy and updatedBy fields of the newly created dataset  |  __Failed__  |
|  Create Dataset and its Datablocks, then reset Datablocks and embedded Datasetlifecycle status  |  should delete the newly created dataset  |  __Failed__  |
|  Simple Sample tests  |  adds a new sample  |  *Passed*  |
|  Simple Sample tests  |  should fetch this new sample  |  *Passed*  |
|  Simple Sample tests  |  should add a new attachment to this sample  |  *Passed*  |
|  Simple Sample tests  |  should fetch this sample attachment  |  __Failed__  |
|  Simple Sample tests  |  should delete this sample attachment  |  *Passed*  |
|  Simple Sample tests  |  should delete this sample  |  *Passed*  |
|  Login with functional accounts  |  Ingestor login fails with incorrect credentials  |  *Passed*  |
|  Login with functional accounts  |  Login should succeed with correct credentials  |  *Passed*  |
