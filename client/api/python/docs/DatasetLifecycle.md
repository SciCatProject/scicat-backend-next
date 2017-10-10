# DatasetLifecycle

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** | ID of status information. This must be the ID of the associated dataset | 
**isOnDisk** | **bool** | Flag which is true, if full dataset is available on disk | [optional] 
**isOnTape** | **bool** | Flag which is true, if full dataset has been stored to tape | [optional] 
**archiveStatusMessage** | **str** | Latest status update message for this dataset from archive system, e.g. archive-in-progress,  60%-stored-on-tape etc | [optional] 
**retrieveStatusMessage** | **str** | Latest status update message for this dataset concerning retrieve from archive system | [optional] 
**dateOfLastMessage** | **datetime** | Time when last status message was sent. Format according to chapter 5.6 internet date/time format in RFC 3339. This will be filled automatically if not provided | [optional] 
**dateOfDiskPurging** | **datetime** | Time when dataset will be removed from disk, assuming that is already stored on tape. Format according to chapter 5.6 internet date/time format in RFC 3339 | [optional] 
**archiveRetentionTime** | **datetime** | When the dataset&#39;s future fate will be evaluated again, e.g. to decide if the dataset can be deleted from archive. Format according to chapter 5.6 internet date/time format in RFC 3339 | [optional] 
**isExported** | **bool** | Flag is true if data was exported to another location | [optional] 
**exportedTo** | **str** | Location of the export destination | [optional] 
**dateOfPublishing** | **datetime** | Date when dataset is supposed to become public according to data policy | [optional] 
**datasetId** | **str** |  | [optional] 
**rawDatasetId** | **str** |  | [optional] 
**derivedDatasetId** | **str** |  | [optional] 
**createdAt** | **datetime** |  | [optional] 
**updatedAt** | **datetime** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


