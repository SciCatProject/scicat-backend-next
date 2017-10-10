# swagger_client.DatasetApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**dataset_count**](DatasetApi.md#dataset_count) | **GET** /Datasets/count | Count instances of the model matched by where from the data source.
[**dataset_create**](DatasetApi.md#dataset_create) | **POST** /Datasets | Create a new instance of the model and persist it into the data source.
[**dataset_create_change_stream_get_datasets_change_stream**](DatasetApi.md#dataset_create_change_stream_get_datasets_change_stream) | **GET** /Datasets/change-stream | Create a change stream.
[**dataset_create_change_stream_post_datasets_change_stream**](DatasetApi.md#dataset_create_change_stream_post_datasets_change_stream) | **POST** /Datasets/change-stream | Create a change stream.
[**dataset_delete_by_id**](DatasetApi.md#dataset_delete_by_id) | **DELETE** /Datasets/{id} | Delete a model instance by {{id}} from the data source.
[**dataset_exists_get_datasetsid_exists**](DatasetApi.md#dataset_exists_get_datasetsid_exists) | **GET** /Datasets/{id}/exists | Check whether a model instance exists in the data source.
[**dataset_exists_head_datasetsid**](DatasetApi.md#dataset_exists_head_datasetsid) | **HEAD** /Datasets/{id} | Check whether a model instance exists in the data source.
[**dataset_find**](DatasetApi.md#dataset_find) | **GET** /Datasets | Find all instances of the model matched by filter from the data source.
[**dataset_find_by_id**](DatasetApi.md#dataset_find_by_id) | **GET** /Datasets/{id} | Find a model instance by {{id}} from the data source.
[**dataset_find_one**](DatasetApi.md#dataset_find_one) | **GET** /Datasets/findOne | Find first instance of the model matched by filter from the data source.
[**dataset_patch_or_create**](DatasetApi.md#dataset_patch_or_create) | **PATCH** /Datasets | Patch an existing model instance or insert a new one into the data source.
[**dataset_prototype_count_datablocks**](DatasetApi.md#dataset_prototype_count_datablocks) | **GET** /Datasets/{id}/datablocks/count | Counts datablocks of Dataset.
[**dataset_prototype_count_origdatablocks**](DatasetApi.md#dataset_prototype_count_origdatablocks) | **GET** /Datasets/{id}/origdatablocks/count | Counts origdatablocks of Dataset.
[**dataset_prototype_create_datablocks**](DatasetApi.md#dataset_prototype_create_datablocks) | **POST** /Datasets/{id}/datablocks | Creates a new instance in datablocks of this model.
[**dataset_prototype_create_datasetlifecycle**](DatasetApi.md#dataset_prototype_create_datasetlifecycle) | **POST** /Datasets/{id}/datasetlifecycle | Creates a new instance in datasetlifecycle of this model.
[**dataset_prototype_create_origdatablocks**](DatasetApi.md#dataset_prototype_create_origdatablocks) | **POST** /Datasets/{id}/origdatablocks | Creates a new instance in origdatablocks of this model.
[**dataset_prototype_delete_datablocks**](DatasetApi.md#dataset_prototype_delete_datablocks) | **DELETE** /Datasets/{id}/datablocks | Deletes all datablocks of this model.
[**dataset_prototype_delete_origdatablocks**](DatasetApi.md#dataset_prototype_delete_origdatablocks) | **DELETE** /Datasets/{id}/origdatablocks | Deletes all origdatablocks of this model.
[**dataset_prototype_destroy_by_id_datablocks**](DatasetApi.md#dataset_prototype_destroy_by_id_datablocks) | **DELETE** /Datasets/{id}/datablocks/{fk} | Delete a related item by id for datablocks.
[**dataset_prototype_destroy_by_id_origdatablocks**](DatasetApi.md#dataset_prototype_destroy_by_id_origdatablocks) | **DELETE** /Datasets/{id}/origdatablocks/{fk} | Delete a related item by id for origdatablocks.
[**dataset_prototype_destroy_datasetlifecycle**](DatasetApi.md#dataset_prototype_destroy_datasetlifecycle) | **DELETE** /Datasets/{id}/datasetlifecycle | Deletes datasetlifecycle of this model.
[**dataset_prototype_find_by_id_datablocks**](DatasetApi.md#dataset_prototype_find_by_id_datablocks) | **GET** /Datasets/{id}/datablocks/{fk} | Find a related item by id for datablocks.
[**dataset_prototype_find_by_id_origdatablocks**](DatasetApi.md#dataset_prototype_find_by_id_origdatablocks) | **GET** /Datasets/{id}/origdatablocks/{fk} | Find a related item by id for origdatablocks.
[**dataset_prototype_get_datablocks**](DatasetApi.md#dataset_prototype_get_datablocks) | **GET** /Datasets/{id}/datablocks | Queries datablocks of Dataset.
[**dataset_prototype_get_datasetlifecycle**](DatasetApi.md#dataset_prototype_get_datasetlifecycle) | **GET** /Datasets/{id}/datasetlifecycle | Fetches hasOne relation datasetlifecycle.
[**dataset_prototype_get_origdatablocks**](DatasetApi.md#dataset_prototype_get_origdatablocks) | **GET** /Datasets/{id}/origdatablocks | Queries origdatablocks of Dataset.
[**dataset_prototype_patch_attributes**](DatasetApi.md#dataset_prototype_patch_attributes) | **PATCH** /Datasets/{id} | Patch attributes for a model instance and persist it into the data source.
[**dataset_prototype_update_by_id_datablocks**](DatasetApi.md#dataset_prototype_update_by_id_datablocks) | **PUT** /Datasets/{id}/datablocks/{fk} | Update a related item by id for datablocks.
[**dataset_prototype_update_by_id_origdatablocks**](DatasetApi.md#dataset_prototype_update_by_id_origdatablocks) | **PUT** /Datasets/{id}/origdatablocks/{fk} | Update a related item by id for origdatablocks.
[**dataset_prototype_update_datasetlifecycle**](DatasetApi.md#dataset_prototype_update_datasetlifecycle) | **PUT** /Datasets/{id}/datasetlifecycle | Update datasetlifecycle of this model.
[**dataset_replace_by_id_post_datasetsid_replace**](DatasetApi.md#dataset_replace_by_id_post_datasetsid_replace) | **POST** /Datasets/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**dataset_replace_by_id_put_datasetsid**](DatasetApi.md#dataset_replace_by_id_put_datasetsid) | **PUT** /Datasets/{id} | Replace attributes for a model instance and persist it into the data source.
[**dataset_replace_or_create_post_datasets_replace_or_create**](DatasetApi.md#dataset_replace_or_create_post_datasets_replace_or_create) | **POST** /Datasets/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**dataset_replace_or_create_put_datasets**](DatasetApi.md#dataset_replace_or_create_put_datasets) | **PUT** /Datasets | Replace an existing model instance or insert a new one into the data source.
[**dataset_update_all**](DatasetApi.md#dataset_update_all) | **POST** /Datasets/update | Update instances of the model matched by {{where}} from the data source.
[**dataset_upsert_with_where**](DatasetApi.md#dataset_upsert_with_where) | **POST** /Datasets/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **dataset_count**
> InlineResponse200 dataset_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.dataset_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_count: %s\n" % e)
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

# **dataset_create**
> Dataset dataset_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
data = swagger_client.Dataset() # Dataset | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.dataset_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Dataset**](Dataset.md)| Model instance data | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_create_change_stream_get_datasets_change_stream**
> file dataset_create_change_stream_get_datasets_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.dataset_create_change_stream_get_datasets_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_create_change_stream_get_datasets_change_stream: %s\n" % e)
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

# **dataset_create_change_stream_post_datasets_change_stream**
> file dataset_create_change_stream_post_datasets_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.dataset_create_change_stream_post_datasets_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_create_change_stream_post_datasets_change_stream: %s\n" % e)
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

# **dataset_delete_by_id**
> object dataset_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.dataset_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_delete_by_id: %s\n" % e)
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

# **dataset_exists_get_datasetsid_exists**
> InlineResponse2001 dataset_exists_get_datasetsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.dataset_exists_get_datasetsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_exists_get_datasetsid_exists: %s\n" % e)
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

# **dataset_exists_head_datasetsid**
> InlineResponse2001 dataset_exists_head_datasetsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.dataset_exists_head_datasetsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_exists_head_datasetsid: %s\n" % e)
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

# **dataset_find**
> list[Dataset] dataset_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.dataset_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[Dataset]**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_find_by_id**
> Dataset dataset_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.dataset_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_find_one**
> Dataset dataset_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.dataset_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_patch_or_create**
> Dataset dataset_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
data = swagger_client.Dataset() # Dataset | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.dataset_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Dataset**](Dataset.md)| Model instance data | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_count_datablocks**
> InlineResponse200 dataset_prototype_count_datablocks(id, where=where)

Counts datablocks of Dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts datablocks of Dataset.
    api_response = api_instance.dataset_prototype_count_datablocks(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_count_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_count_origdatablocks**
> InlineResponse200 dataset_prototype_count_origdatablocks(id, where=where)

Counts origdatablocks of Dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts origdatablocks of Dataset.
    api_response = api_instance.dataset_prototype_count_origdatablocks(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_count_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_create_datablocks**
> Datablock dataset_prototype_create_datablocks(id, data=data)

Creates a new instance in datablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
data = swagger_client.Datablock() # Datablock |  (optional)

try: 
    # Creates a new instance in datablocks of this model.
    api_response = api_instance.dataset_prototype_create_datablocks(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_create_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **data** | [**Datablock**](Datablock.md)|  | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_create_datasetlifecycle**
> DatasetLifecycle dataset_prototype_create_datasetlifecycle(id, data=data)

Creates a new instance in datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle |  (optional)

try: 
    # Creates a new instance in datasetlifecycle of this model.
    api_response = api_instance.dataset_prototype_create_datasetlifecycle(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_create_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_create_origdatablocks**
> OrigDatablock dataset_prototype_create_origdatablocks(id, data=data)

Creates a new instance in origdatablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
data = swagger_client.OrigDatablock() # OrigDatablock |  (optional)

try: 
    # Creates a new instance in origdatablocks of this model.
    api_response = api_instance.dataset_prototype_create_origdatablocks(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_create_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **data** | [**OrigDatablock**](OrigDatablock.md)|  | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_delete_datablocks**
> dataset_prototype_delete_datablocks(id)

Deletes all datablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id

try: 
    # Deletes all datablocks of this model.
    api_instance.dataset_prototype_delete_datablocks(id)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_delete_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_delete_origdatablocks**
> dataset_prototype_delete_origdatablocks(id)

Deletes all origdatablocks of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id

try: 
    # Deletes all origdatablocks of this model.
    api_instance.dataset_prototype_delete_origdatablocks(id)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_delete_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_destroy_by_id_datablocks**
> dataset_prototype_destroy_by_id_datablocks(id, fk)

Delete a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
fk = 'fk_example' # str | Foreign key for datablocks

try: 
    # Delete a related item by id for datablocks.
    api_instance.dataset_prototype_destroy_by_id_datablocks(id, fk)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_destroy_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **fk** | **str**| Foreign key for datablocks | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_destroy_by_id_origdatablocks**
> dataset_prototype_destroy_by_id_origdatablocks(id, fk)

Delete a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
fk = 'fk_example' # str | Foreign key for origdatablocks

try: 
    # Delete a related item by id for origdatablocks.
    api_instance.dataset_prototype_destroy_by_id_origdatablocks(id, fk)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_destroy_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_destroy_datasetlifecycle**
> dataset_prototype_destroy_datasetlifecycle(id)

Deletes datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id

try: 
    # Deletes datasetlifecycle of this model.
    api_instance.dataset_prototype_destroy_datasetlifecycle(id)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_destroy_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_find_by_id_datablocks**
> Datablock dataset_prototype_find_by_id_datablocks(id, fk)

Find a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
fk = 'fk_example' # str | Foreign key for datablocks

try: 
    # Find a related item by id for datablocks.
    api_response = api_instance.dataset_prototype_find_by_id_datablocks(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_find_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **fk** | **str**| Foreign key for datablocks | 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_find_by_id_origdatablocks**
> OrigDatablock dataset_prototype_find_by_id_origdatablocks(id, fk)

Find a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
fk = 'fk_example' # str | Foreign key for origdatablocks

try: 
    # Find a related item by id for origdatablocks.
    api_response = api_instance.dataset_prototype_find_by_id_origdatablocks(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_find_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **fk** | **str**| Foreign key for origdatablocks | 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_get_datablocks**
> list[Datablock] dataset_prototype_get_datablocks(id, filter=filter)

Queries datablocks of Dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries datablocks of Dataset.
    api_response = api_instance.dataset_prototype_get_datablocks(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_get_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[Datablock]**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_get_datasetlifecycle**
> DatasetLifecycle dataset_prototype_get_datasetlifecycle(id, refresh=refresh)

Fetches hasOne relation datasetlifecycle.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
refresh = true # bool |  (optional)

try: 
    # Fetches hasOne relation datasetlifecycle.
    api_response = api_instance.dataset_prototype_get_datasetlifecycle(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_get_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_get_origdatablocks**
> list[OrigDatablock] dataset_prototype_get_origdatablocks(id, filter=filter)

Queries origdatablocks of Dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries origdatablocks of Dataset.
    api_response = api_instance.dataset_prototype_get_origdatablocks(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_get_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[OrigDatablock]**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_patch_attributes**
> Dataset dataset_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
data = swagger_client.Dataset() # Dataset | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.dataset_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **data** | [**Dataset**](Dataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_prototype_update_by_id_datablocks**
> Datablock dataset_prototype_update_by_id_datablocks(id, fk, data=data)

Update a related item by id for datablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
fk = 'fk_example' # str | Foreign key for datablocks
data = swagger_client.Datablock() # Datablock |  (optional)

try: 
    # Update a related item by id for datablocks.
    api_response = api_instance.dataset_prototype_update_by_id_datablocks(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_update_by_id_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
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

# **dataset_prototype_update_by_id_origdatablocks**
> OrigDatablock dataset_prototype_update_by_id_origdatablocks(id, fk, data=data)

Update a related item by id for origdatablocks.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
fk = 'fk_example' # str | Foreign key for origdatablocks
data = swagger_client.OrigDatablock() # OrigDatablock |  (optional)

try: 
    # Update a related item by id for origdatablocks.
    api_response = api_instance.dataset_prototype_update_by_id_origdatablocks(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_update_by_id_origdatablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
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

# **dataset_prototype_update_datasetlifecycle**
> DatasetLifecycle dataset_prototype_update_datasetlifecycle(id, data=data)

Update datasetlifecycle of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Dataset id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle |  (optional)

try: 
    # Update datasetlifecycle of this model.
    api_response = api_instance.dataset_prototype_update_datasetlifecycle(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_prototype_update_datasetlifecycle: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Dataset id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)|  | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_replace_by_id_post_datasetsid_replace**
> Dataset dataset_replace_by_id_post_datasetsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Model id
data = swagger_client.Dataset() # Dataset | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.dataset_replace_by_id_post_datasetsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_replace_by_id_post_datasetsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Dataset**](Dataset.md)| Model instance data | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_replace_by_id_put_datasetsid**
> Dataset dataset_replace_by_id_put_datasetsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
id = 'id_example' # str | Model id
data = swagger_client.Dataset() # Dataset | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.dataset_replace_by_id_put_datasetsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_replace_by_id_put_datasetsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Dataset**](Dataset.md)| Model instance data | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_replace_or_create_post_datasets_replace_or_create**
> Dataset dataset_replace_or_create_post_datasets_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
data = swagger_client.Dataset() # Dataset | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.dataset_replace_or_create_post_datasets_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_replace_or_create_post_datasets_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Dataset**](Dataset.md)| Model instance data | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_replace_or_create_put_datasets**
> Dataset dataset_replace_or_create_put_datasets(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
data = swagger_client.Dataset() # Dataset | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.dataset_replace_or_create_put_datasets(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_replace_or_create_put_datasets: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Dataset**](Dataset.md)| Model instance data | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_update_all**
> InlineResponse2002 dataset_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Dataset() # Dataset | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.dataset_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Dataset**](Dataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_upsert_with_where**
> Dataset dataset_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Dataset() # Dataset | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.dataset_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetApi->dataset_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Dataset**](Dataset.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

