# swagger_client.RawDatasetApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**raw_dataset_count**](RawDatasetApi.md#raw_dataset_count) | **GET** /RawDatasets/count | Count instances of the model matched by where from the data source.
[**raw_dataset_create**](RawDatasetApi.md#raw_dataset_create) | **POST** /RawDatasets | Create a new instance of the model and persist it into the data source.
[**raw_dataset_create_change_stream_get_raw_datasets_change_stream**](RawDatasetApi.md#raw_dataset_create_change_stream_get_raw_datasets_change_stream) | **GET** /RawDatasets/change-stream | Create a change stream.
[**raw_dataset_create_change_stream_post_raw_datasets_change_stream**](RawDatasetApi.md#raw_dataset_create_change_stream_post_raw_datasets_change_stream) | **POST** /RawDatasets/change-stream | Create a change stream.
[**raw_dataset_delete_by_id**](RawDatasetApi.md#raw_dataset_delete_by_id) | **DELETE** /RawDatasets/{id} | Delete a model instance by {{id}} from the data source.
[**raw_dataset_exists_get_raw_datasetsid_exists**](RawDatasetApi.md#raw_dataset_exists_get_raw_datasetsid_exists) | **GET** /RawDatasets/{id}/exists | Check whether a model instance exists in the data source.
[**raw_dataset_exists_head_raw_datasetsid**](RawDatasetApi.md#raw_dataset_exists_head_raw_datasetsid) | **HEAD** /RawDatasets/{id} | Check whether a model instance exists in the data source.
[**raw_dataset_facet**](RawDatasetApi.md#raw_dataset_facet) | **POST** /RawDatasets/facet | Search for numbers associated with dataset properties. I.e. How many datasets in Group A. Default returns: Creation Location, Owner Groups and Creation Time
[**raw_dataset_find**](RawDatasetApi.md#raw_dataset_find) | **GET** /RawDatasets | Find all instances of the model matched by filter from the data source.
[**raw_dataset_find_by_id**](RawDatasetApi.md#raw_dataset_find_by_id) | **GET** /RawDatasets/{id} | Find a model instance by {{id}} from the data source.
[**raw_dataset_find_one**](RawDatasetApi.md#raw_dataset_find_one) | **GET** /RawDatasets/findOne | Find first instance of the model matched by filter from the data source.
[**raw_dataset_is_valid**](RawDatasetApi.md#raw_dataset_is_valid) | **POST** /RawDatasets/isValid | Check if data is valid according to a schema
[**raw_dataset_patch_or_create**](RawDatasetApi.md#raw_dataset_patch_or_create) | **PATCH** /RawDatasets | Patch an existing model instance or insert a new one into the data source.
[**raw_dataset_prototype_count_datablocks**](RawDatasetApi.md#raw_dataset_prototype_count_datablocks) | **GET** /RawDatasets/{id}/datablocks/count | Counts datablocks of RawDataset.
[**raw_dataset_prototype_count_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_count_origdatablocks) | **GET** /RawDatasets/{id}/origdatablocks/count | Counts origdatablocks of RawDataset.
[**raw_dataset_prototype_create_datablocks**](RawDatasetApi.md#raw_dataset_prototype_create_datablocks) | **POST** /RawDatasets/{id}/datablocks | Creates a new instance in datablocks of this model.
[**raw_dataset_prototype_create_datasetlifecycle**](RawDatasetApi.md#raw_dataset_prototype_create_datasetlifecycle) | **POST** /RawDatasets/{id}/datasetlifecycle | Creates a new instance in datasetlifecycle of this model.
[**raw_dataset_prototype_create_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_create_origdatablocks) | **POST** /RawDatasets/{id}/origdatablocks | Creates a new instance in origdatablocks of this model.
[**raw_dataset_prototype_delete_datablocks**](RawDatasetApi.md#raw_dataset_prototype_delete_datablocks) | **DELETE** /RawDatasets/{id}/datablocks | Deletes all datablocks of this model.
[**raw_dataset_prototype_delete_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_delete_origdatablocks) | **DELETE** /RawDatasets/{id}/origdatablocks | Deletes all origdatablocks of this model.
[**raw_dataset_prototype_destroy_by_id_datablocks**](RawDatasetApi.md#raw_dataset_prototype_destroy_by_id_datablocks) | **DELETE** /RawDatasets/{id}/datablocks/{fk} | Delete a related item by id for datablocks.
[**raw_dataset_prototype_destroy_by_id_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_destroy_by_id_origdatablocks) | **DELETE** /RawDatasets/{id}/origdatablocks/{fk} | Delete a related item by id for origdatablocks.
[**raw_dataset_prototype_destroy_datasetlifecycle**](RawDatasetApi.md#raw_dataset_prototype_destroy_datasetlifecycle) | **DELETE** /RawDatasets/{id}/datasetlifecycle | Deletes datasetlifecycle of this model.
[**raw_dataset_prototype_find_by_id_datablocks**](RawDatasetApi.md#raw_dataset_prototype_find_by_id_datablocks) | **GET** /RawDatasets/{id}/datablocks/{fk} | Find a related item by id for datablocks.
[**raw_dataset_prototype_find_by_id_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_find_by_id_origdatablocks) | **GET** /RawDatasets/{id}/origdatablocks/{fk} | Find a related item by id for origdatablocks.
[**raw_dataset_prototype_get_datablocks**](RawDatasetApi.md#raw_dataset_prototype_get_datablocks) | **GET** /RawDatasets/{id}/datablocks | Queries datablocks of RawDataset.
[**raw_dataset_prototype_get_datasetlifecycle**](RawDatasetApi.md#raw_dataset_prototype_get_datasetlifecycle) | **GET** /RawDatasets/{id}/datasetlifecycle | Fetches hasOne relation datasetlifecycle.
[**raw_dataset_prototype_get_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_get_origdatablocks) | **GET** /RawDatasets/{id}/origdatablocks | Queries origdatablocks of RawDataset.
[**raw_dataset_prototype_get_proposal**](RawDatasetApi.md#raw_dataset_prototype_get_proposal) | **GET** /RawDatasets/{id}/proposal | Fetches belongsTo relation proposal.
[**raw_dataset_prototype_get_sample**](RawDatasetApi.md#raw_dataset_prototype_get_sample) | **GET** /RawDatasets/{id}/sample | Fetches belongsTo relation sample.
[**raw_dataset_prototype_patch_attributes**](RawDatasetApi.md#raw_dataset_prototype_patch_attributes) | **PATCH** /RawDatasets/{id} | Patch attributes for a model instance and persist it into the data source.
[**raw_dataset_prototype_update_by_id_datablocks**](RawDatasetApi.md#raw_dataset_prototype_update_by_id_datablocks) | **PUT** /RawDatasets/{id}/datablocks/{fk} | Update a related item by id for datablocks.
[**raw_dataset_prototype_update_by_id_origdatablocks**](RawDatasetApi.md#raw_dataset_prototype_update_by_id_origdatablocks) | **PUT** /RawDatasets/{id}/origdatablocks/{fk} | Update a related item by id for origdatablocks.
[**raw_dataset_prototype_update_datasetlifecycle**](RawDatasetApi.md#raw_dataset_prototype_update_datasetlifecycle) | **PUT** /RawDatasets/{id}/datasetlifecycle | Update datasetlifecycle of this model.
[**raw_dataset_replace_by_id_post_raw_datasetsid_replace**](RawDatasetApi.md#raw_dataset_replace_by_id_post_raw_datasetsid_replace) | **POST** /RawDatasets/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**raw_dataset_replace_by_id_put_raw_datasetsid**](RawDatasetApi.md#raw_dataset_replace_by_id_put_raw_datasetsid) | **PUT** /RawDatasets/{id} | Replace attributes for a model instance and persist it into the data source.
[**raw_dataset_replace_or_create_post_raw_datasets_replace_or_create**](RawDatasetApi.md#raw_dataset_replace_or_create_post_raw_datasets_replace_or_create) | **POST** /RawDatasets/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**raw_dataset_replace_or_create_put_raw_datasets**](RawDatasetApi.md#raw_dataset_replace_or_create_put_raw_datasets) | **PUT** /RawDatasets | Replace an existing model instance or insert a new one into the data source.
[**raw_dataset_reset**](RawDatasetApi.md#raw_dataset_reset) | **POST** /RawDatasets/resetArchiveStatus | Delete datablocks of dataset and reset status message
[**raw_dataset_update_all**](RawDatasetApi.md#raw_dataset_update_all) | **POST** /RawDatasets/update | Update instances of the model matched by {{where}} from the data source.
[**raw_dataset_upsert_with_where**](RawDatasetApi.md#raw_dataset_upsert_with_where) | **POST** /RawDatasets/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **raw_dataset_count**
> InlineResponse200 raw_dataset_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.raw_dataset_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_count: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_create**
> RawDataset raw_dataset_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
data = swagger_client.RawDataset() # RawDataset | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.raw_dataset_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**RawDataset**](RawDataset.md)| Model instance data | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_create_change_stream_get_raw_datasets_change_stream**
> file raw_dataset_create_change_stream_get_raw_datasets_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.raw_dataset_create_change_stream_get_raw_datasets_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_create_change_stream_get_raw_datasets_change_stream: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **options** | **str**|  | [optional] 

### Return type

[**file**](file.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_create_change_stream_post_raw_datasets_change_stream**
> file raw_dataset_create_change_stream_post_raw_datasets_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.raw_dataset_create_change_stream_post_raw_datasets_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_create_change_stream_post_raw_datasets_change_stream: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **options** | **str**|  | [optional] 

### Return type

[**file**](file.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_delete_by_id**
> object raw_dataset_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.raw_dataset_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_delete_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_exists_get_raw_datasetsid_exists**
> InlineResponse2001 raw_dataset_exists_get_raw_datasetsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.raw_dataset_exists_get_raw_datasetsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_exists_get_raw_datasetsid_exists: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_exists_head_raw_datasetsid**
> InlineResponse2001 raw_dataset_exists_head_raw_datasetsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.raw_dataset_exists_head_raw_datasetsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_exists_head_raw_datasetsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_facet**
> InlineResponse2004 raw_dataset_facet(fields=fields, facets=facets)

Search for numbers associated with dataset properties. I.e. How many datasets in Group A. Default returns: Creation Location, Owner Groups and Creation Time

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
fields = 'fields_example' # str | Define the fields to search by, these will be mapped to the Dataset object and ensure the fields exist. There is also support for a `text` search to look for keywords. Can be undefined. (optional)
facets = 'facets_example' # str | This should follow the Mongo Facet syntax (https://docs.mongodb.com/manual/reference/operator/aggregation/facet/). Can be undefined and uses defaults explained in description of route. (optional)

try: 
    # Search for numbers associated with dataset properties. I.e. How many datasets in Group A. Default returns: Creation Location, Owner Groups and Creation Time
    api_response = api_instance.raw_dataset_facet(fields=fields, facets=facets)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_facet: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fields** | **str**| Define the fields to search by, these will be mapped to the Dataset object and ensure the fields exist. There is also support for a &#x60;text&#x60; search to look for keywords. Can be undefined. | [optional] 
 **facets** | **str**| This should follow the Mongo Facet syntax (https://docs.mongodb.com/manual/reference/operator/aggregation/facet/). Can be undefined and uses defaults explained in description of route. | [optional] 

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_find**
> list[RawDataset] raw_dataset_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.raw_dataset_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[RawDataset]**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_find_by_id**
> RawDataset raw_dataset_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.raw_dataset_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_find_one**
> RawDataset raw_dataset_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.raw_dataset_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_is_valid**
> XAny raw_dataset_is_valid(ownableItem=ownableItem)

Check if data is valid according to a schema

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
ownableItem = NULL # object |  (optional)

try: 
    # Check if data is valid according to a schema
    api_response = api_instance.raw_dataset_is_valid(ownableItem=ownableItem)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_is_valid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ownableItem** | **object**|  | [optional] 

### Return type

[**XAny**](XAny.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_patch_or_create**
> RawDataset raw_dataset_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
data = swagger_client.RawDataset() # RawDataset | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.raw_dataset_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**RawDataset**](RawDataset.md)| Model instance data | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_count_datablocks**
> InlineResponse200 raw_dataset_prototype_count_datablocks(id, where=where)

Counts datablocks of RawDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts datablocks of RawDataset.
    api_response = api_instance.raw_dataset_prototype_count_datablocks(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_count_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_count_origdatablocks**
> InlineResponse200 raw_dataset_prototype_count_origdatablocks(id, where=where)

Counts origdatablocks of RawDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts origdatablocks of RawDataset.
    api_response = api_instance.raw_dataset_prototype_count_origdatablocks(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_count_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_create_datablocks**
> Datablock raw_dataset_prototype_create_datablocks(id, data=data)

Creates a new instance in datablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
data = swagger_client.Datablock() # Datablock |  (optional)

try: 
    # Creates a new instance in datablocks of this model.
    api_response = api_instance.raw_dataset_prototype_create_datablocks(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_create_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **data** | [**Datablock**](Datablock.md)|  | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_create_datasetlifecycle**
> DatasetLifecycle raw_dataset_prototype_create_datasetlifecycle(id, data=data)

Creates a new instance in datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle |  (optional)

try: 
    # Creates a new instance in datasetlifecycle of this model.
    api_response = api_instance.raw_dataset_prototype_create_datasetlifecycle(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_create_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_create_origdatablocks**
> OrigDatablock raw_dataset_prototype_create_origdatablocks(id, data=data)

Creates a new instance in origdatablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
data = swagger_client.OrigDatablock() # OrigDatablock |  (optional)

try: 
    # Creates a new instance in origdatablocks of this model.
    api_response = api_instance.raw_dataset_prototype_create_origdatablocks(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_create_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **data** | [**OrigDatablock**](OrigDatablock.md)|  | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_delete_datablocks**
> raw_dataset_prototype_delete_datablocks(id)

Deletes all datablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id

try: 
    # Deletes all datablocks of this model.
    api_instance.raw_dataset_prototype_delete_datablocks(id)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_delete_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_delete_origdatablocks**
> raw_dataset_prototype_delete_origdatablocks(id)

Deletes all origdatablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id

try: 
    # Deletes all origdatablocks of this model.
    api_instance.raw_dataset_prototype_delete_origdatablocks(id)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_delete_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_destroy_by_id_datablocks**
> raw_dataset_prototype_destroy_by_id_datablocks(id, fk)

Delete a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
fk = 'fk_example' # str | Foreign key for datablocks

try: 
    # Delete a related item by id for datablocks.
    api_instance.raw_dataset_prototype_destroy_by_id_datablocks(id, fk)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_destroy_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **fk** | **str**| Foreign key for datablocks | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_destroy_by_id_origdatablocks**
> raw_dataset_prototype_destroy_by_id_origdatablocks(id, fk)

Delete a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
fk = 'fk_example' # str | Foreign key for origdatablocks

try: 
    # Delete a related item by id for origdatablocks.
    api_instance.raw_dataset_prototype_destroy_by_id_origdatablocks(id, fk)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_destroy_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_destroy_datasetlifecycle**
> raw_dataset_prototype_destroy_datasetlifecycle(id)

Deletes datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id

try: 
    # Deletes datasetlifecycle of this model.
    api_instance.raw_dataset_prototype_destroy_datasetlifecycle(id)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_destroy_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_find_by_id_datablocks**
> Datablock raw_dataset_prototype_find_by_id_datablocks(id, fk)

Find a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
fk = 'fk_example' # str | Foreign key for datablocks

try: 
    # Find a related item by id for datablocks.
    api_response = api_instance.raw_dataset_prototype_find_by_id_datablocks(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_find_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **fk** | **str**| Foreign key for datablocks | 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_find_by_id_origdatablocks**
> OrigDatablock raw_dataset_prototype_find_by_id_origdatablocks(id, fk)

Find a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
fk = 'fk_example' # str | Foreign key for origdatablocks

try: 
    # Find a related item by id for origdatablocks.
    api_response = api_instance.raw_dataset_prototype_find_by_id_origdatablocks(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_find_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_get_datablocks**
> list[Datablock] raw_dataset_prototype_get_datablocks(id, filter=filter)

Queries datablocks of RawDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries datablocks of RawDataset.
    api_response = api_instance.raw_dataset_prototype_get_datablocks(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_get_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[Datablock]**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_get_datasetlifecycle**
> DatasetLifecycle raw_dataset_prototype_get_datasetlifecycle(id, refresh=refresh)

Fetches hasOne relation datasetlifecycle.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
refresh = true # bool |  (optional)

try: 
    # Fetches hasOne relation datasetlifecycle.
    api_response = api_instance.raw_dataset_prototype_get_datasetlifecycle(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_get_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_get_origdatablocks**
> list[OrigDatablock] raw_dataset_prototype_get_origdatablocks(id, filter=filter)

Queries origdatablocks of RawDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries origdatablocks of RawDataset.
    api_response = api_instance.raw_dataset_prototype_get_origdatablocks(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_get_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[OrigDatablock]**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_get_proposal**
> Proposal raw_dataset_prototype_get_proposal(id, refresh=refresh)

Fetches belongsTo relation proposal.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation proposal.
    api_response = api_instance.raw_dataset_prototype_get_proposal(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_get_proposal: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_get_sample**
> Sample raw_dataset_prototype_get_sample(id, refresh=refresh)

Fetches belongsTo relation sample.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation sample.
    api_response = api_instance.raw_dataset_prototype_get_sample(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_get_sample: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**Sample**](Sample.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_patch_attributes**
> RawDataset raw_dataset_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
data = swagger_client.RawDataset() # RawDataset | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.raw_dataset_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **data** | [**RawDataset**](RawDataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_update_by_id_datablocks**
> Datablock raw_dataset_prototype_update_by_id_datablocks(id, fk, data=data)

Update a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
fk = 'fk_example' # str | Foreign key for datablocks
data = swagger_client.Datablock() # Datablock |  (optional)

try: 
    # Update a related item by id for datablocks.
    api_response = api_instance.raw_dataset_prototype_update_by_id_datablocks(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_update_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **fk** | **str**| Foreign key for datablocks | 
 **data** | [**Datablock**](Datablock.md)|  | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_update_by_id_origdatablocks**
> OrigDatablock raw_dataset_prototype_update_by_id_origdatablocks(id, fk, data=data)

Update a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
fk = 'fk_example' # str | Foreign key for origdatablocks
data = swagger_client.OrigDatablock() # OrigDatablock |  (optional)

try: 
    # Update a related item by id for origdatablocks.
    api_response = api_instance.raw_dataset_prototype_update_by_id_origdatablocks(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_update_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 
 **data** | [**OrigDatablock**](OrigDatablock.md)|  | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_prototype_update_datasetlifecycle**
> DatasetLifecycle raw_dataset_prototype_update_datasetlifecycle(id, data=data)

Update datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | RawDataset id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle |  (optional)

try: 
    # Update datasetlifecycle of this model.
    api_response = api_instance.raw_dataset_prototype_update_datasetlifecycle(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_prototype_update_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| RawDataset id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_replace_by_id_post_raw_datasetsid_replace**
> RawDataset raw_dataset_replace_by_id_post_raw_datasetsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | Model id
data = swagger_client.RawDataset() # RawDataset | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.raw_dataset_replace_by_id_post_raw_datasetsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_replace_by_id_post_raw_datasetsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**RawDataset**](RawDataset.md)| Model instance data | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_replace_by_id_put_raw_datasetsid**
> RawDataset raw_dataset_replace_by_id_put_raw_datasetsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
id = 'id_example' # str | Model id
data = swagger_client.RawDataset() # RawDataset | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.raw_dataset_replace_by_id_put_raw_datasetsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_replace_by_id_put_raw_datasetsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**RawDataset**](RawDataset.md)| Model instance data | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_replace_or_create_post_raw_datasets_replace_or_create**
> RawDataset raw_dataset_replace_or_create_post_raw_datasets_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
data = swagger_client.RawDataset() # RawDataset | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.raw_dataset_replace_or_create_post_raw_datasets_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_replace_or_create_post_raw_datasets_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**RawDataset**](RawDataset.md)| Model instance data | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_replace_or_create_put_raw_datasets**
> RawDataset raw_dataset_replace_or_create_put_raw_datasets(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
data = swagger_client.RawDataset() # RawDataset | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.raw_dataset_replace_or_create_put_raw_datasets(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_replace_or_create_put_raw_datasets: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**RawDataset**](RawDataset.md)| Model instance data | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_reset**
> InlineResponse2003 raw_dataset_reset(datasetId=datasetId)

Delete datablocks of dataset and reset status message

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
datasetId = 'datasetId_example' # str |  (optional)

try: 
    # Delete datablocks of dataset and reset status message
    api_response = api_instance.raw_dataset_reset(datasetId=datasetId)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_reset: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **datasetId** | **str**|  | [optional] 

### Return type

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_update_all**
> InlineResponse2002 raw_dataset_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.RawDataset() # RawDataset | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.raw_dataset_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**RawDataset**](RawDataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **raw_dataset_upsert_with_where**
> RawDataset raw_dataset_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RawDatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.RawDataset() # RawDataset | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.raw_dataset_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RawDatasetApi->raw_dataset_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**RawDataset**](RawDataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**RawDataset**](RawDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

