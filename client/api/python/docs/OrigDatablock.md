# OrigDatablock

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | [**ObjectID**](ObjectID.md) |  | [optional] 
**size** | **float** | Total size in bytes of all files contained in the dataFileList | 
**dataFileList** | [**list[Datafile]**](Datafile.md) | List of files contained in the linked dataset. Files can be regular files, folders and softlinks. In case the linked dataset has a source *folder* all file paths are relative file paths. In the single file dataset case the path is the fullpath to the dataset file on the source system. | 
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


