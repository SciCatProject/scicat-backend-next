# swagger_client.DatasetLifecycleApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**dataset_lifecycle_count**](DatasetLifecycleApi.md#dataset_lifecycle_count) | **GET** /DatasetLifecycles/count | Count instances of the model matched by where from the data source.
[**dataset_lifecycle_create**](DatasetLifecycleApi.md#dataset_lifecycle_create) | **POST** /DatasetLifecycles | Create a new instance of the model and persist it into the data source.
[**dataset_lifecycle_create_change_stream_get_dataset_lifecycles_change_stream**](DatasetLifecycleApi.md#dataset_lifecycle_create_change_stream_get_dataset_lifecycles_change_stream) | **GET** /DatasetLifecycles/change-stream | Create a change stream.
[**dataset_lifecycle_create_change_stream_post_dataset_lifecycles_change_stream**](DatasetLifecycleApi.md#dataset_lifecycle_create_change_stream_post_dataset_lifecycles_change_stream) | **POST** /DatasetLifecycles/change-stream | Create a change stream.
[**dataset_lifecycle_delete_by_id**](DatasetLifecycleApi.md#dataset_lifecycle_delete_by_id) | **DELETE** /DatasetLifecycles/{id} | Delete a model instance by {{id}} from the data source.
[**dataset_lifecycle_exists_get_dataset_lifecyclesid_exists**](DatasetLifecycleApi.md#dataset_lifecycle_exists_get_dataset_lifecyclesid_exists) | **GET** /DatasetLifecycles/{id}/exists | Check whether a model instance exists in the data source.
[**dataset_lifecycle_exists_head_dataset_lifecyclesid**](DatasetLifecycleApi.md#dataset_lifecycle_exists_head_dataset_lifecyclesid) | **HEAD** /DatasetLifecycles/{id} | Check whether a model instance exists in the data source.
[**dataset_lifecycle_find**](DatasetLifecycleApi.md#dataset_lifecycle_find) | **GET** /DatasetLifecycles | Find all instances of the model matched by filter from the data source.
[**dataset_lifecycle_find_by_id**](DatasetLifecycleApi.md#dataset_lifecycle_find_by_id) | **GET** /DatasetLifecycles/{id} | Find a model instance by {{id}} from the data source.
[**dataset_lifecycle_find_one**](DatasetLifecycleApi.md#dataset_lifecycle_find_one) | **GET** /DatasetLifecycles/findOne | Find first instance of the model matched by filter from the data source.
[**dataset_lifecycle_is_valid**](DatasetLifecycleApi.md#dataset_lifecycle_is_valid) | **POST** /DatasetLifecycles/isValid | Check if data is valid according to a schema
[**dataset_lifecycle_patch_or_create_patch_dataset_lifecycles**](DatasetLifecycleApi.md#dataset_lifecycle_patch_or_create_patch_dataset_lifecycles) | **PATCH** /DatasetLifecycles | Patch an existing model instance or insert a new one into the data source.
[**dataset_lifecycle_patch_or_create_put_dataset_lifecycles**](DatasetLifecycleApi.md#dataset_lifecycle_patch_or_create_put_dataset_lifecycles) | **PUT** /DatasetLifecycles | Patch an existing model instance or insert a new one into the data source.
[**dataset_lifecycle_prototype_get_dataset**](DatasetLifecycleApi.md#dataset_lifecycle_prototype_get_dataset) | **GET** /DatasetLifecycles/{id}/dataset | Fetches belongsTo relation dataset.
[**dataset_lifecycle_prototype_patch_attributes_patch_dataset_lifecyclesid**](DatasetLifecycleApi.md#dataset_lifecycle_prototype_patch_attributes_patch_dataset_lifecyclesid) | **PATCH** /DatasetLifecycles/{id} | Patch attributes for a model instance and persist it into the data source.
[**dataset_lifecycle_prototype_patch_attributes_put_dataset_lifecyclesid**](DatasetLifecycleApi.md#dataset_lifecycle_prototype_patch_attributes_put_dataset_lifecyclesid) | **PUT** /DatasetLifecycles/{id} | Patch attributes for a model instance and persist it into the data source.
[**dataset_lifecycle_replace_by_id**](DatasetLifecycleApi.md#dataset_lifecycle_replace_by_id) | **POST** /DatasetLifecycles/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**dataset_lifecycle_replace_or_create**](DatasetLifecycleApi.md#dataset_lifecycle_replace_or_create) | **POST** /DatasetLifecycles/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**dataset_lifecycle_update_all**](DatasetLifecycleApi.md#dataset_lifecycle_update_all) | **POST** /DatasetLifecycles/update | Update instances of the model matched by {{where}} from the data source.
[**dataset_lifecycle_upsert_with_where**](DatasetLifecycleApi.md#dataset_lifecycle_upsert_with_where) | **POST** /DatasetLifecycles/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **dataset_lifecycle_count**
> InlineResponse200 dataset_lifecycle_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.dataset_lifecycle_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_count: %s\n" % e)
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

# **dataset_lifecycle_create**
> DatasetLifecycle dataset_lifecycle_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.dataset_lifecycle_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| Model instance data | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_create_change_stream_get_dataset_lifecycles_change_stream**
> file dataset_lifecycle_create_change_stream_get_dataset_lifecycles_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.dataset_lifecycle_create_change_stream_get_dataset_lifecycles_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_create_change_stream_get_dataset_lifecycles_change_stream: %s\n" % e)
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

# **dataset_lifecycle_create_change_stream_post_dataset_lifecycles_change_stream**
> file dataset_lifecycle_create_change_stream_post_dataset_lifecycles_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.dataset_lifecycle_create_change_stream_post_dataset_lifecycles_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_create_change_stream_post_dataset_lifecycles_change_stream: %s\n" % e)
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

# **dataset_lifecycle_delete_by_id**
> object dataset_lifecycle_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.dataset_lifecycle_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_delete_by_id: %s\n" % e)
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

# **dataset_lifecycle_exists_get_dataset_lifecyclesid_exists**
> InlineResponse2001 dataset_lifecycle_exists_get_dataset_lifecyclesid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.dataset_lifecycle_exists_get_dataset_lifecyclesid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_exists_get_dataset_lifecyclesid_exists: %s\n" % e)
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

# **dataset_lifecycle_exists_head_dataset_lifecyclesid**
> InlineResponse2001 dataset_lifecycle_exists_head_dataset_lifecyclesid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.dataset_lifecycle_exists_head_dataset_lifecyclesid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_exists_head_dataset_lifecyclesid: %s\n" % e)
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

# **dataset_lifecycle_find**
> list[DatasetLifecycle] dataset_lifecycle_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.dataset_lifecycle_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[DatasetLifecycle]**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_find_by_id**
> DatasetLifecycle dataset_lifecycle_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.dataset_lifecycle_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_find_one**
> DatasetLifecycle dataset_lifecycle_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.dataset_lifecycle_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_is_valid**
> XAny dataset_lifecycle_is_valid(ownableItem=ownableItem)

Check if data is valid according to a schema

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
ownableItem = NULL # object |  (optional)

try: 
    # Check if data is valid according to a schema
    api_response = api_instance.dataset_lifecycle_is_valid(ownableItem=ownableItem)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_is_valid: %s\n" % e)
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

# **dataset_lifecycle_patch_or_create_patch_dataset_lifecycles**
> DatasetLifecycle dataset_lifecycle_patch_or_create_patch_dataset_lifecycles(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.dataset_lifecycle_patch_or_create_patch_dataset_lifecycles(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_patch_or_create_patch_dataset_lifecycles: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| Model instance data | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_patch_or_create_put_dataset_lifecycles**
> DatasetLifecycle dataset_lifecycle_patch_or_create_put_dataset_lifecycles(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.dataset_lifecycle_patch_or_create_put_dataset_lifecycles(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_patch_or_create_put_dataset_lifecycles: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| Model instance data | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_prototype_get_dataset**
> Dataset dataset_lifecycle_prototype_get_dataset(id, refresh=refresh)

Fetches belongsTo relation dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | DatasetLifecycle id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation dataset.
    api_response = api_instance.dataset_lifecycle_prototype_get_dataset(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_prototype_get_dataset: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DatasetLifecycle id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_prototype_patch_attributes_patch_dataset_lifecyclesid**
> DatasetLifecycle dataset_lifecycle_prototype_patch_attributes_patch_dataset_lifecyclesid(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | DatasetLifecycle id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.dataset_lifecycle_prototype_patch_attributes_patch_dataset_lifecyclesid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_prototype_patch_attributes_patch_dataset_lifecyclesid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DatasetLifecycle id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| An object of model property name/value pairs | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_prototype_patch_attributes_put_dataset_lifecyclesid**
> DatasetLifecycle dataset_lifecycle_prototype_patch_attributes_put_dataset_lifecyclesid(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | DatasetLifecycle id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.dataset_lifecycle_prototype_patch_attributes_put_dataset_lifecyclesid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_prototype_patch_attributes_put_dataset_lifecyclesid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| DatasetLifecycle id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| An object of model property name/value pairs | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_replace_by_id**
> DatasetLifecycle dataset_lifecycle_replace_by_id(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
id = 'id_example' # str | Model id
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.dataset_lifecycle_replace_by_id(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_replace_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| Model instance data | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_replace_or_create**
> DatasetLifecycle dataset_lifecycle_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.dataset_lifecycle_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| Model instance data | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_update_all**
> InlineResponse2002 dataset_lifecycle_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.dataset_lifecycle_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataset_lifecycle_upsert_with_where**
> DatasetLifecycle dataset_lifecycle_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatasetLifecycleApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.DatasetLifecycle() # DatasetLifecycle | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.dataset_lifecycle_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatasetLifecycleApi->dataset_lifecycle_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**DatasetLifecycle**](DatasetLifecycle.md)| An object of model property name/value pairs | [optional] 

### Return type

[**DatasetLifecycle**](DatasetLifecycle.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

