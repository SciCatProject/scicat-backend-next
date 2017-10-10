# DerivedDataset

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**investigator** | **str** | Email of person pursuing the data analysis | 
**inputDatasets** | **list[str]** | Array of input dataset identifiers used in producing the derived dataset. Ideally these are the global identifier to existing datasets inside this or federated data catalogs | 
**usedSoftware** | **list[str]** | A list of links to software repositories which uniquely identifies the software used and the version for yielding the derived data | 
**jobParameters** | **object** | The creation process of the drived data will usually depend on input job parameters. The full structure of these input parameters are stored here | [optional] 
**jobLogData** | **str** | The output job logfile. Keep the size of this log data well below 15 MB  | [optional] 
**pid** | **str** | Persistent Identifier for datasets derived from UUIDv4 and prepended automatically by site specific PID prefix like 20.500.12345/ | 
**owner** | **str** | Owner of the data set, usually first name + lastname | 
**ownerEmail** | **str** | Email of owner of the data set | [optional] 
**orcidOfOwner** | **str** | ORCID of owner https://orcid.org if available | [optional] 
**contactEmail** | **str** | Email of contact person for this dataset | 
**sourceFolder** | **str** | Absolute file path on file server containing the files of this dataset, optionally including protocol and file server hostname, e.g. nfs://fileserver1.example.com/some/path/to/sourcefolder | 
**size** | **float** | Total size of all source files contained in source folder on disk when unpacked | [optional] 
**packedSize** | **float** | Total size of all datablock package files created for this dataset | [optional] 
**creationTime** | **datetime** | Time when dataset became fully available on disk, i.e. all containing files have been written. Format according to chapter 5.6 internet date/time format in RFC 3339 | 
**type** | **str** | Characterize data, e.g. as raw, derived, test, calibration data | 
**validationStatus** | **str** | Defines a level of trust, e.g. a measure of how much data was verified or used by other persons | [optional] 
**keywords** | **list[str]** | Array of tags associated with the meaning or contents of this dataset. Values should ideally come from defined vocabularies, taxonomies, ontologies or knowledge graphs | [optional] 
**description** | **str** | Free text explanation of contents of dataset | [optional] 
**userTargetLocation** | **str** | User choosable absolute virtual path where datasets are stored. Mainly used as a help for the enduser at dataset retrieval time to find the proper dataset. Will be prepended by p-group | [optional] 
**classification** | **str** | ACIA information about AUthenticity,COnfidentiality,INtegrity and AVailability requirements of dataset. E.g. AV(ailabilty)&#x3D;medium could trigger the creation of a two tape copies. Format &#39;AV&#x3D;medium,CO&#x3D;low&#39; | [optional] 
**license** | **str** | Name of license under which data can be used | [optional] 
**version** | **str** | Version of API used in creation of dataset | [optional] 
**doi** | **str** | Digital object Identifier like doi: used for publication purposes | [optional] 
**isPublished** | **bool** | Flag is true when data are made publically available | [optional] 
**ownerGroup** | **str** | Defines the group which owns the data, and therefore has unrestricted access to this data. Usually a pgroup like p12151 | 
**accessGroups** | **list[str]** | Optional additional groups which have read access to the data. Users which are member in one of the groups listed here are allowed to access this data. The special group &#39;public&#39; makes data available to all users | [optional] 
**createdAt** | **datetime** |  | [optional] 
**updatedAt** | **datetime** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


