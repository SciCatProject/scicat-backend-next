# Job

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**emailJobInitiator** | **str** | The email of the person initiating the job request | 
**type** | **str** | Type of job, e.g. archive, retrieve etc | [default to 'retrieve']
**creationTime** | **datetime** | Time when job is created. Format according to chapter 5.6 internet date/time format in RFC 3339 | [optional] 
**executionTime** | **datetime** | Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339 | [optional] 
**jobParams** | **object** | Object of key-value pairs defining job input parameters, e.g. &#39;desinationPath&#39; for retrieve jobs or &#39;tapeCopies&#39; for archive jobs | [optional] 
**jobStatusMessage** | **str** | Defines current status of job lifecycle | [optional] 
**datasetList** | **object** | Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected or an explicit list of dataset-relative file paths, which should be selected | 
**id** | [**ObjectID**](ObjectID.md) |  | [optional] 
**createdAt** | **datetime** |  | [optional] 
**updatedAt** | **datetime** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


