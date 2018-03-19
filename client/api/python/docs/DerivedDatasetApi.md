# swagger_client.DerivedDatasetApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**derived_dataset_count**](DerivedDatasetApi.md#derived_dataset_count) | **GET** /DerivedDatasets/count | Count instances of the model matched by where from the data source.
[**derived_dataset_create**](DerivedDatasetApi.md#derived_dataset_create) | **POST** /DerivedDatasets | Create a new instance of the model and persist it into the data source.
[**derived_dataset_create_change_stream_get_derived_datasets_change_stream**](DerivedDatasetApi.md#derived_dataset_create_change_stream_get_derived_datasets_change_stream) | **GET** /DerivedDatasets/change-stream | Create a change stream.
[**derived_dataset_create_change_stream_post_derived_datasets_change_stream**](DerivedDatasetApi.md#derived_dataset_create_change_stream_post_derived_datasets_change_stream) | **POST** /DerivedDatasets/change-stream | Create a change stream.
[**derived_dataset_delete_by_id**](DerivedDatasetApi.md#derived_dataset_delete_by_id) | **DELETE** /DerivedDatasets/{id} | Delete a model instance by {{id}} from the data source.
[**derived_dataset_exists_get_derived_datasetsid_exists**](DerivedDatasetApi.md#derived_dataset_exists_get_derived_datasetsid_exists) | **GET** /DerivedDatasets/{id}/exists | Check whether a model instance exists in the data source.
[**derived_dataset_exists_head_derived_datasetsid**](DerivedDatasetApi.md#derived_dataset_exists_head_derived_datasetsid) | **HEAD** /DerivedDatasets/{id} | Check whether a model instance exists in the data source.
[**derived_dataset_facet**](DerivedDatasetApi.md#derived_dataset_facet) | **POST** /DerivedDatasets/facet | Search for numbers associated with dataset properties. I.e. How many datasets in Group A. Default returns: Creation Location, Owner Groups and Creation Time
[**derived_dataset_find**](DerivedDatasetApi.md#derived_dataset_find) | **GET** /DerivedDatasets | Find all instances of the model matched by filter from the data source.
[**derived_dataset_find_by_id**](DerivedDatasetApi.md#derived_dataset_find_by_id) | **GET** /DerivedDatasets/{id} | Find a model instance by {{id}} from the data source.
[**derived_dataset_find_one**](DerivedDatasetApi.md#derived_dataset_find_one) | **GET** /DerivedDatasets/findOne | Find first instance of the model matched by filter from the data source.
[**derived_dataset_is_valid**](DerivedDatasetApi.md#derived_dataset_is_valid) | **POST** /DerivedDatasets/isValid | Check if data is valid according to a schema
[**derived_dataset_patch_or_create**](DerivedDatasetApi.md#derived_dataset_patch_or_create) | **PATCH** /DerivedDatasets | Patch an existing model instance or insert a new one into the data source.
[**derived_dataset_prototype_count_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_count_datablocks) | **GET** /DerivedDatasets/{id}/datablocks/count | Counts datablocks of DerivedDataset.
[**derived_dataset_prototype_count_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_count_origdatablocks) | **GET** /DerivedDatasets/{id}/origdatablocks/count | Counts origdatablocks of DerivedDataset.
[**derived_dataset_prototype_create_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_create_datablocks) | **POST** /DerivedDatasets/{id}/datablocks | Creates a new instance in datablocks of this model.
[**derived_dataset_prototype_create_datasetlifecycle**](DerivedDatasetApi.md#derived_dataset_prototype_create_datasetlifecycle) | **POST** /DerivedDatasets/{id}/datasetlifecycle | Creates a new instance in datasetlifecycle of this model.
[**derived_dataset_prototype_create_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_create_origdatablocks) | **POST** /DerivedDatasets/{id}/origdatablocks | Creates a new instance in origdatablocks of this model.
[**derived_dataset_prototype_delete_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_delete_datablocks) | **DELETE** /DerivedDatasets/{id}/datablocks | Deletes all datablocks of this model.
[**derived_dataset_prototype_delete_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_delete_origdatablocks) | **DELETE** /DerivedDatasets/{id}/origdatablocks | Deletes all origdatablocks of this model.
[**derived_dataset_prototype_destroy_by_id_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_destroy_by_id_datablocks) | **DELETE** /DerivedDatasets/{id}/datablocks/{fk} | Delete a related item by id for datablocks.
[**derived_dataset_prototype_destroy_by_id_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_destroy_by_id_origdatablocks) | **DELETE** /DerivedDatasets/{id}/origdatablocks/{fk} | Delete a related item by id for origdatablocks.
[**derived_dataset_prototype_destroy_datasetlifecycle**](DerivedDatasetApi.md#derived_dataset_prototype_destroy_datasetlifecycle) | **DELETE** /DerivedDatasets/{id}/datasetlifecycle | Deletes datasetlifecycle of this model.
[**derived_dataset_prototype_find_by_id_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_find_by_id_datablocks) | **GET** /DerivedDatasets/{id}/datablocks/{fk} | Find a related item by id for datablocks.
[**derived_dataset_prototype_find_by_id_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_find_by_id_origdatablocks) | **GET** /DerivedDatasets/{id}/origdatablocks/{fk} | Find a related item by id for origdatablocks.
[**derived_dataset_prototype_get_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_get_datablocks) | **GET** /DerivedDatasets/{id}/datablocks | Queries datablocks of DerivedDataset.
[**derived_dataset_prototype_get_datasetlifecycle**](DerivedDatasetApi.md#derived_dataset_prototype_get_datasetlifecycle) | **GET** /DerivedDatasets/{id}/datasetlifecycle | Fetches hasOne relation datasetlifecycle.
[**derived_dataset_prototype_get_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_get_origdatablocks) | **GET** /DerivedDatasets/{id}/origdatablocks | Queries origdatablocks of DerivedDataset.
[**derived_dataset_prototype_patch_attributes**](DerivedDatasetApi.md#derived_dataset_prototype_patch_attributes) | **PATCH** /DerivedDatasets/{id} | Patch attributes for a model instance and persist it into the data source.
[**derived_dataset_prototype_update_by_id_datablocks**](DerivedDatasetApi.md#derived_dataset_prototype_update_by_id_datablocks) | **PUT** /DerivedDatasets/{id}/datablocks/{fk} | Update a related item by id for datablocks.
[**derived_dataset_prototype_update_by_id_origdatablocks**](DerivedDatasetApi.md#derived_dataset_prototype_update_by_id_origdatablocks) | **PUT** /DerivedDatasets/{id}/origdatablocks/{fk} | Update a related item by id for origdatablocks.
[**derived_dataset_prototype_update_datasetlifecycle**](DerivedDatasetApi.md#derived_dataset_prototype_update_datasetlifecycle) | **PUT** /DerivedDatasets/{id}/datasetlifecycle | Update datasetlifecycle of this model.
[**derived_dataset_replace_by_id_post_derived_datasetsid_replace**](DerivedDatasetApi.md#derived_dataset_replace_by_id_post_derived_datasetsid_replace) | **POST** /DerivedDatasets/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**derived_dataset_replace_by_id_put_derived_datasetsid**](DerivedDatasetApi.md#derived_dataset_replace_by_id_put_derived_datasetsid) | **PUT** /DerivedDatasets/{id} | Replace attributes for a model instance and persist it into the data source.
[**derived_dataset_replace_or_create_post_derived_datasets_replace_or_create**](DerivedDatasetApi.md#derived_dataset_replace_or_create_post_derived_datasets_replace_or_create) | **POST** /DerivedDatasets/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**derived_dataset_replace_or_create_put_derived_datasets**](DerivedDatasetApi.md#derived_dataset_replace_or_create_put_derived_datasets) | **PUT** /DerivedDatasets | Replace an existing model instance or insert a new one into the data source.
[**derived_dataset_reset**](DerivedDatasetApi.md#derived_dataset_reset) | **POST** /DerivedDatasets/resetArchiveStatus | Delete datablocks of dataset and reset status message
[**derived_dataset_update_all**](DerivedDatasetApi.md#derived_dataset_update_all) | **POST** /DerivedDatasets/update | Update instances of the model matched by {{where}} from the data source.
[**derived_dataset_upsert_with_where**](DerivedDatasetApi.md#derived_dataset_upsert_with_where) | **POST** /DerivedDatasets/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **derived_dataset_count**
> InlineResponse200 derived_dataset_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.derived_dataset_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_count: %s\n" % e)
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

# **derived_dataset_create**
> DerivedDataset derived_dataset_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
data = swagger_client.DerivedDataset() # DerivedDataset | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.derived_dataset_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DerivedDataset**](DerivedDataset.md)| Model instance data | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_create_change_stream_get_derived_datasets_change_stream**
> file derived_dataset_create_change_stream_get_derived_datasets_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.derived_dataset_create_change_stream_get_derived_datasets_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_create_change_stream_get_derived_datasets_change_stream: %s\n" % e)
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

# **derived_dataset_create_change_stream_post_derived_datasets_change_stream**
> file derived_dataset_create_change_stream_post_derived_datasets_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.derived_dataset_create_change_stream_post_derived_datasets_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_create_change_stream_post_derived_datasets_change_stream: %s\n" % e)
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

# **derived_dataset_delete_by_id**
> object derived_dataset_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.derived_dataset_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_delete_by_id: %s\n" % e)
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

# **derived_dataset_exists_get_derived_datasetsid_exists**
> InlineResponse2001 derived_dataset_exists_get_derived_datasetsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.derived_dataset_exists_get_derived_datasetsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_exists_get_derived_datasetsid_exists: %s\n" % e)
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

# **derived_dataset_exists_head_derived_datasetsid**
> InlineResponse2001 derived_dataset_exists_head_derived_datasetsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.derived_dataset_exists_head_derived_datasetsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_exists_head_derived_datasetsid: %s\n" % e)
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

# **derived_dataset_facet**
> InlineResponse2004 derived_dataset_facet(fields=fields, facets=facets)

Search for numbers associated with dataset properties. I.e. How many datasets in Group A. Default returns: Creation Location, Owner Groups and Creation Time

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
fields = 'fields_example' # str | Define the fields to search by, these will be mapped to the Dataset object and ensure the fields exist. There is also support for a `text` search to look for keywords. Can be undefined. (optional)
facets = 'facets_example' # str | This should follow the Mongo Facet syntax (https://docs.mongodb.com/manual/reference/operator/aggregation/facet/). Can be undefined and uses defaults explained in description of route. (optional)

try: 
    # Search for numbers associated with dataset properties. I.e. How many datasets in Group A. Default returns: Creation Location, Owner Groups and Creation Time
    api_response = api_instance.derived_dataset_facet(fields=fields, facets=facets)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_facet: %s\n" % e)
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

# **derived_dataset_find**
> list[DerivedDataset] derived_dataset_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.derived_dataset_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[DerivedDataset]**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_find_by_id**
> DerivedDataset derived_dataset_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.derived_dataset_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_find_one**
> DerivedDataset derived_dataset_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.derived_dataset_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_is_valid**
> XAny derived_dataset_is_valid(ownableItem=ownableItem)

Check if data is valid according to a schema

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
ownableItem = NULL # object |  (optional)

try: 
    # Check if data is valid according to a schema
    api_response = api_instance.derived_dataset_is_valid(ownableItem=ownableItem)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_is_valid: %s\n" % e)
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

# **derived_dataset_patch_or_create**
> DerivedDataset derived_dataset_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
data = swagger_client.DerivedDataset() # DerivedDataset | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.derived_dataset_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DerivedDataset**](DerivedDataset.md)| Model instance data | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_count_datablocks**
> InlineResponse200 derived_dataset_prototype_count_datablocks(id, where=where)

Counts datablocks of DerivedDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts datablocks of DerivedDataset.
    api_response = api_instance.derived_dataset_prototype_count_datablocks(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_count_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_count_origdatablocks**
> InlineResponse200 derived_dataset_prototype_count_origdatablocks(id, where=where)

Counts origdatablocks of DerivedDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts origdatablocks of DerivedDataset.
    api_response = api_instance.derived_dataset_prototype_count_origdatablocks(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_count_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_create_datablocks**
> Datablock derived_dataset_prototype_create_datablocks(id, data=data)

Creates a new instance in datablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
data = swagger_client.Datablock() # Datablock |  (optional)

try: 
    # Creates a new instance in datablocks of this model.
    api_response = api_instance.derived_dataset_prototype_create_datablocks(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_create_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **data** | [**Datablock**](Datablock.md)|  | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_create_datasetlifecycle**
> DatasetLifecycle derived_dataset_prototype_create_datasetlifecycle(id, data=data)

Creates a new instance in datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle |  (optional)

try: 
    # Creates a new instance in datasetlifecycle of this model.
    api_response = api_instance.derived_dataset_prototype_create_datasetlifecycle(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_create_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_create_origdatablocks**
> OrigDatablock derived_dataset_prototype_create_origdatablocks(id, data=data)

Creates a new instance in origdatablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
data = swagger_client.OrigDatablock() # OrigDatablock |  (optional)

try: 
    # Creates a new instance in origdatablocks of this model.
    api_response = api_instance.derived_dataset_prototype_create_origdatablocks(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_create_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **data** | [**OrigDatablock**](OrigDatablock.md)|  | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_delete_datablocks**
> derived_dataset_prototype_delete_datablocks(id)

Deletes all datablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id

try: 
    # Deletes all datablocks of this model.
    api_instance.derived_dataset_prototype_delete_datablocks(id)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_delete_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_delete_origdatablocks**
> derived_dataset_prototype_delete_origdatablocks(id)

Deletes all origdatablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id

try: 
    # Deletes all origdatablocks of this model.
    api_instance.derived_dataset_prototype_delete_origdatablocks(id)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_delete_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_destroy_by_id_datablocks**
> derived_dataset_prototype_destroy_by_id_datablocks(id, fk)

Delete a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
fk = 'fk_example' # str | Foreign key for datablocks

try: 
    # Delete a related item by id for datablocks.
    api_instance.derived_dataset_prototype_destroy_by_id_datablocks(id, fk)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_destroy_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **fk** | **str**| Foreign key for datablocks | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_destroy_by_id_origdatablocks**
> derived_dataset_prototype_destroy_by_id_origdatablocks(id, fk)

Delete a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
fk = 'fk_example' # str | Foreign key for origdatablocks

try: 
    # Delete a related item by id for origdatablocks.
    api_instance.derived_dataset_prototype_destroy_by_id_origdatablocks(id, fk)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_destroy_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_destroy_datasetlifecycle**
> derived_dataset_prototype_destroy_datasetlifecycle(id)

Deletes datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id

try: 
    # Deletes datasetlifecycle of this model.
    api_instance.derived_dataset_prototype_destroy_datasetlifecycle(id)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_destroy_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_find_by_id_datablocks**
> Datablock derived_dataset_prototype_find_by_id_datablocks(id, fk)

Find a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
fk = 'fk_example' # str | Foreign key for datablocks

try: 
    # Find a related item by id for datablocks.
    api_response = api_instance.derived_dataset_prototype_find_by_id_datablocks(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_find_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **fk** | **str**| Foreign key for datablocks | 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_find_by_id_origdatablocks**
> OrigDatablock derived_dataset_prototype_find_by_id_origdatablocks(id, fk)

Find a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
fk = 'fk_example' # str | Foreign key for origdatablocks

try: 
    # Find a related item by id for origdatablocks.
    api_response = api_instance.derived_dataset_prototype_find_by_id_origdatablocks(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_find_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_get_datablocks**
> list[Datablock] derived_dataset_prototype_get_datablocks(id, filter=filter)

Queries datablocks of DerivedDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries datablocks of DerivedDataset.
    api_response = api_instance.derived_dataset_prototype_get_datablocks(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_get_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[Datablock]**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_get_datasetlifecycle**
> DatasetLifecycle derived_dataset_prototype_get_datasetlifecycle(id, refresh=refresh)

Fetches hasOne relation datasetlifecycle.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
refresh = true # bool |  (optional)

try: 
    # Fetches hasOne relation datasetlifecycle.
    api_response = api_instance.derived_dataset_prototype_get_datasetlifecycle(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_get_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_get_origdatablocks**
> list[OrigDatablock] derived_dataset_prototype_get_origdatablocks(id, filter=filter)

Queries origdatablocks of DerivedDataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries origdatablocks of DerivedDataset.
    api_response = api_instance.derived_dataset_prototype_get_origdatablocks(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_get_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[OrigDatablock]**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_patch_attributes**
> DerivedDataset derived_dataset_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
data = swagger_client.DerivedDataset() # DerivedDataset | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.derived_dataset_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **data** | [**DerivedDataset**](DerivedDataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_prototype_update_by_id_datablocks**
> Datablock derived_dataset_prototype_update_by_id_datablocks(id, fk, data=data)

Update a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
fk = 'fk_example' # str | Foreign key for datablocks
data = swagger_client.Datablock() # Datablock |  (optional)

try: 
    # Update a related item by id for datablocks.
    api_response = api_instance.derived_dataset_prototype_update_by_id_datablocks(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_update_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
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

# **derived_dataset_prototype_update_by_id_origdatablocks**
> OrigDatablock derived_dataset_prototype_update_by_id_origdatablocks(id, fk, data=data)

Update a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
fk = 'fk_example' # str | Foreign key for origdatablocks
data = swagger_client.OrigDatablock() # OrigDatablock |  (optional)

try: 
    # Update a related item by id for origdatablocks.
    api_response = api_instance.derived_dataset_prototype_update_by_id_origdatablocks(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_update_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
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

# **derived_dataset_prototype_update_datasetlifecycle**
> DatasetLifecycle derived_dataset_prototype_update_datasetlifecycle(id, data=data)

Update datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | DerivedDataset id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle |  (optional)

try: 
    # Update datasetlifecycle of this model.
    api_response = api_instance.derived_dataset_prototype_update_datasetlifecycle(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_prototype_update_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DerivedDataset id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_replace_by_id_post_derived_datasetsid_replace**
> DerivedDataset derived_dataset_replace_by_id_post_derived_datasetsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | Model id
data = swagger_client.DerivedDataset() # DerivedDataset | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.derived_dataset_replace_by_id_post_derived_datasetsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_replace_by_id_post_derived_datasetsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**DerivedDataset**](DerivedDataset.md)| Model instance data | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_replace_by_id_put_derived_datasetsid**
> DerivedDataset derived_dataset_replace_by_id_put_derived_datasetsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
id = 'id_example' # str | Model id
data = swagger_client.DerivedDataset() # DerivedDataset | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.derived_dataset_replace_by_id_put_derived_datasetsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_replace_by_id_put_derived_datasetsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**DerivedDataset**](DerivedDataset.md)| Model instance data | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_replace_or_create_post_derived_datasets_replace_or_create**
> DerivedDataset derived_dataset_replace_or_create_post_derived_datasets_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
data = swagger_client.DerivedDataset() # DerivedDataset | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.derived_dataset_replace_or_create_post_derived_datasets_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_replace_or_create_post_derived_datasets_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DerivedDataset**](DerivedDataset.md)| Model instance data | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_replace_or_create_put_derived_datasets**
> DerivedDataset derived_dataset_replace_or_create_put_derived_datasets(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
data = swagger_client.DerivedDataset() # DerivedDataset | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.derived_dataset_replace_or_create_put_derived_datasets(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_replace_or_create_put_derived_datasets: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DerivedDataset**](DerivedDataset.md)| Model instance data | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_reset**
> InlineResponse2003 derived_dataset_reset(datasetId=datasetId)

Delete datablocks of dataset and reset status message

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
datasetId = 'datasetId_example' # str |  (optional)

try: 
    # Delete datablocks of dataset and reset status message
    api_response = api_instance.derived_dataset_reset(datasetId=datasetId)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_reset: %s\n" % e)
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

# **derived_dataset_update_all**
> InlineResponse2002 derived_dataset_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.DerivedDataset() # DerivedDataset | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.derived_dataset_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**DerivedDataset**](DerivedDataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **derived_dataset_upsert_with_where**
> DerivedDataset derived_dataset_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DerivedDatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.DerivedDataset() # DerivedDataset | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.derived_dataset_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DerivedDatasetApi->derived_dataset_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**DerivedDataset**](DerivedDataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**DerivedDataset**](DerivedDataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

