# Datablock

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** | Catalog internal UUIDv4 for datablock | 
**archiveId** | **str** | Unique identifier given bey archive system to the stored datablock. This id is used when data is retrieved back. | 
**size** | **float** | Total size in bytes of all files in datablock when unpacked | 
**packedSize** | **float** | Size of datablock package file | [optional] 
**chkAlg** | **str** | Algoritm used for calculation of checksums, e.g. sha2 | [optional] 
**version** | **str** | Version string defining format of how data is packed and stored in archive | 
**dataFileList** | [**list[Datafile]**](Datafile.md) |  | 
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


