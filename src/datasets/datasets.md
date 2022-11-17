# Datasets documentation

## Schema migration
### Base dataset schema
Extend: _Ownable_

| Field | Class property |  | ApiProperty |  |  |  |  | Prop |  |  |  |  |  | DTO |  |  | Loopback |  |  |  |  |  
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | type | Array | type	| required | description | reference| default | type | unique | required | index | sparse | default | type | optional | validation | type | array | index |	required |  
| pid |	string |  | String | FALSE | Persistent Identifier for datasets derived from UUIDv4 and prepended automatically by site specific PID prefix like 20.500.12345/	|  | uuidv4() | String | TRUE | TRUE |  |  |   | string | y | isString |
| _id | string |  |  |  |  |  |  |	String |  
| owner | string |  | String |  | Owner or custodian of the data set, usually first name + lastname. The string may contain a list of persons, which should then be seperated by semicolons. |  |  | String | TRUE | TRUE |   |  | | string |  | isString |  
| ownerEmail | string		String		Email of owner or of custodian of the data set. The string may contain a list of emails, which should then be seperated by semicolons.			-empty							string		isEmail					
orcidOfOwner	string		String		ORCID of owner/custodian. The string may contain a list of ORCID, which should then be separated by semicolons.			-empty							string	y	isString					
contactEmail	string		String		Email of contact person for this dataset. The string may contain a list of emails, which should then be seperated by semicolons.			String		TRUE	TRUE				string		isEmail					
sourceFolder	string		String		Absolute file path on file server containing the files of this dataset, e.g. /some/path/to/sourcefolder. In case of a single file dataset, e.g. HDF5 data, it contains the path up to, but excluding the filename. Trailing slashes are removed.			String		TRUE	TRUE				string		isString					
sourceFolderHost	string		String		DNS host name of file server hosting sourceFolder, optionally including protocol e.g. [protocol://]fileserver1.example.com			String			TRUE				string	Y	isFQDN					
size	number		Number		Total size of all source files contained in source folder on disk when unpacked			Number			TRUE				number		isInt					
packedSize	number		Number		Total size of all datablock package files created for this dataset			Number							number	y	isInt					
numberOfFiles	number		Number		Total number of lines in filelisting of all OrigDatablocks for this dataset			-em,pty							number		isInt					
numberOfFilesArchived	number		Number		Total number of lines in filelisting of all Datablocks for this dataset			-empty							number	y	isInt					
creationTime	Date		Date		Time when dataset became fully available on disk, i.e. all containing files have been written. Format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.			Date		TRUE	TRUE				Date		isDateString					
type	string		String		Characterize type of dataset, either 'base' or 'raw' or 'derived'. Autofilled when choosing the proper inherited models			-empty							string		isString					
validationStatus	string		String		Defines a level of trust, e.g. a measure of how much data was verified or used by other persons			[String]							string		isString					
keywords	string[]	Y	[String]		Array of tags associated with the meaning or contents of this dataset. Values should ideally come from defined vocabularies, taxonomies, ontologies or knowledge graphs			-empty							string[]		isString(each)					
description	string		String		Free text explanation of contents of dataset			-empty							string	y	isString					
datasetName	string		String		A name for the dataset, given by the creator to carry some semantic meaning. Useful for display purposes e.g. instead of displaying the pid. Will be autofilled if missing using info from sourceFolder			-empty							string		isString					
classification	string		String		ACIA information about AUthenticity,COnfidentiality,INtegrity and AVailability requirements of dataset. E.g. AV(ailabilty)=medium could trigger the creation of a two tape copies. Format 'AV=medium,CO=low'			-empty					FALSE		string	y	isString					
license	string		String		Name of license under which data can be used										string	y	isString					
version	string		String		Version of API used in creation of dataset										string	y	isString					
isPublished	boolean		Boolean		Flag is true when data are made publically available										boolean		isBoolean					
history	Record<string, unknown>[]	Y	[Object]		List of objects containing old value and new value																	
datasetlifecycle	LifecycleSchema		Lifecycle		For each dataset there exists an embedded dataset lifecycle document which describes the current status of the dataset during its lifetime with respect to the storage handling systems																	
instrumentId	string		String	FALSE	ID of instrument where the data was created																	
techniques	Technique[]	Y	array		Stores the metadata information for techniques	Technique									Technique[]	y	ValidationNested					
relationships	Relationship[]		array		Stores the relationships with other datasets	Relationship									Relationship[]	y	ValidationNested					
sharedWith	string[]	Y	[String]		List of users that the dataset has been shared with										string[]	y	isString(each)					
attachments	Attachment[]		array		Small less than 16 MB attachments, envisaged for png/jpeg previews	Attachment																
origidatablocks	OrigDatablock[]	Y	array		Container list all files and their attributes which make up a dataset. Usually Filled at the time the datasets metadata is created in the data catalog. Can be used by subsequent archiving processes to create the archived datasets.	OrigDatablock																
datablocks	Datablock[]	Y	array		When archiving a dataset all files contained in the dataset are listed here together with their checksum information. Several datablocks can be created if the file listing is too long for a single datablock. This partitioning decision is done by the archiving system to allow for chunks of datablocks with managable sizes. E.g a dataset consisting of 10 TB of data could be split into 10 datablocks of about 1 TB each. The upper limit set by the data catalog system itself is given by the fact that documents must be smaller than 16 MB, which typically allows for datasets of about 100000 files.	Datablock																
