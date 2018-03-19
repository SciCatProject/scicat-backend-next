# DatasetLifecycle

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** | ID of status information. This must be the ID of the associated dataset | 
**isOnDisk** | **bool** | Flag which is true, if full dataset is available on disk | [optional] 
**isOnTape** | **bool** | Flag which is true, if full dataset has been stored to tape | [optional] 
**archiveStatusMessage** | **str** | Current status of Dataset with respect to storage on disk/tape | [optional] 
**retrieveStatusMessage** | **str** | Latest message for this dataset concerning retrieve from archive system | [optional] 
**lastUpdateMessage** | **str** | Latest status update / transition message for this dataset | [optional] 
**archiveReturnMessage** | **str** | Detailed status or error message returned by archive system when treating this dataset | [optional] 
**dateOfLastMessage** | **datetime** | Time when last status message was sent. Format according to chapter 5.6 internet date/time format in RFC 3339. This will be filled automatically if not provided. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server | [optional] 
**dateOfDiskPurging** | **datetime** | Day when dataset will be removed from disk, assuming that is already stored on tape. | [optional] 
**archiveRetentionTime** | **datetime** | Day when the dataset&#39;s future fate will be evaluated again, e.g. to decide if the dataset can be deleted from archive. | [optional] 
**isExported** | **bool** | Flag is true if data was exported to another location | [optional] 
**exportedTo** | **str** | Location of the export destination | [optional] 
**dateOfPublishing** | **datetime** | Day when dataset is supposed to become public according to data policy | [optional] 
**ownerGroup** | **str** | Defines the group which owns the data, and therefore has unrestricted access to this data. Usually a pgroup like p12151 | 
**accessGroups** | **list[str]** | Optional additional groups which have read access to the data. Users which are member in one of the groups listed here are allowed to access this data. The special group &#39;public&#39; makes data available to all users | [optional] 
**createdBy** | **str** | Functional or user account name who created this instance | [optional] 
**updatedBy** | **str** | Functional or user account name who last updated this instance | [optional] 
**datasetId** | **str** |  | [optional] 
**rawDatasetId** | **str** |  | [optional] 
**derivedDatasetId** | **str** |  | [optional] 
**createdAt** | **datetime** |  | [optional] 
**updatedAt** | **datetime** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


