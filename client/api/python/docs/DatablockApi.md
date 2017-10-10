# swagger_client.DatablockApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**datablock_count**](DatablockApi.md#datablock_count) | **GET** /Datablocks/count | Count instances of the model matched by where from the data source.
[**datablock_create**](DatablockApi.md#datablock_create) | **POST** /Datablocks | Create a new instance of the model and persist it into the data source.
[**datablock_create_change_stream_get_datablocks_change_stream**](DatablockApi.md#datablock_create_change_stream_get_datablocks_change_stream) | **GET** /Datablocks/change-stream | Create a change stream.
[**datablock_create_change_stream_post_datablocks_change_stream**](DatablockApi.md#datablock_create_change_stream_post_datablocks_change_stream) | **POST** /Datablocks/change-stream | Create a change stream.
[**datablock_delete_by_id**](DatablockApi.md#datablock_delete_by_id) | **DELETE** /Datablocks/{id} | Delete a model instance by {{id}} from the data source.
[**datablock_exists_get_datablocksid_exists**](DatablockApi.md#datablock_exists_get_datablocksid_exists) | **GET** /Datablocks/{id}/exists | Check whether a model instance exists in the data source.
[**datablock_exists_head_datablocksid**](DatablockApi.md#datablock_exists_head_datablocksid) | **HEAD** /Datablocks/{id} | Check whether a model instance exists in the data source.
[**datablock_find**](DatablockApi.md#datablock_find) | **GET** /Datablocks | Find all instances of the model matched by filter from the data source.
[**datablock_find_by_id**](DatablockApi.md#datablock_find_by_id) | **GET** /Datablocks/{id} | Find a model instance by {{id}} from the data source.
[**datablock_find_one**](DatablockApi.md#datablock_find_one) | **GET** /Datablocks/findOne | Find first instance of the model matched by filter from the data source.
[**datablock_patch_or_create**](DatablockApi.md#datablock_patch_or_create) | **PATCH** /Datablocks | Patch an existing model instance or insert a new one into the data source.
[**datablock_prototype_get_dataset**](DatablockApi.md#datablock_prototype_get_dataset) | **GET** /Datablocks/{id}/dataset | Fetches belongsTo relation dataset.
[**datablock_prototype_patch_attributes**](DatablockApi.md#datablock_prototype_patch_attributes) | **PATCH** /Datablocks/{id} | Patch attributes for a model instance and persist it into the data source.
[**datablock_replace_by_id_post_datablocksid_replace**](DatablockApi.md#datablock_replace_by_id_post_datablocksid_replace) | **POST** /Datablocks/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**datablock_replace_by_id_put_datablocksid**](DatablockApi.md#datablock_replace_by_id_put_datablocksid) | **PUT** /Datablocks/{id} | Replace attributes for a model instance and persist it into the data source.
[**datablock_replace_or_create_post_datablocks_replace_or_create**](DatablockApi.md#datablock_replace_or_create_post_datablocks_replace_or_create) | **POST** /Datablocks/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**datablock_replace_or_create_put_datablocks**](DatablockApi.md#datablock_replace_or_create_put_datablocks) | **PUT** /Datablocks | Replace an existing model instance or insert a new one into the data source.
[**datablock_update_all**](DatablockApi.md#datablock_update_all) | **POST** /Datablocks/update | Update instances of the model matched by {{where}} from the data source.
[**datablock_upsert_with_where**](DatablockApi.md#datablock_upsert_with_where) | **POST** /Datablocks/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **datablock_count**
> InlineResponse200 datablock_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.datablock_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_count: %s\n" % e)
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

# **datablock_create**
> Datablock datablock_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
data = swagger_client.Datablock() # Datablock | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.datablock_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Datablock**](Datablock.md)| Model instance data | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_create_change_stream_get_datablocks_change_stream**
> file datablock_create_change_stream_get_datablocks_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.datablock_create_change_stream_get_datablocks_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_create_change_stream_get_datablocks_change_stream: %s\n" % e)
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

# **datablock_create_change_stream_post_datablocks_change_stream**
> file datablock_create_change_stream_post_datablocks_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.datablock_create_change_stream_post_datablocks_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_create_change_stream_post_datablocks_change_stream: %s\n" % e)
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

# **datablock_delete_by_id**
> object datablock_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.datablock_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_delete_by_id: %s\n" % e)
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

# **datablock_exists_get_datablocksid_exists**
> InlineResponse2001 datablock_exists_get_datablocksid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.datablock_exists_get_datablocksid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_exists_get_datablocksid_exists: %s\n" % e)
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

# **datablock_exists_head_datablocksid**
> InlineResponse2001 datablock_exists_head_datablocksid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.datablock_exists_head_datablocksid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_exists_head_datablocksid: %s\n" % e)
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

# **datablock_find**
> list[Datablock] datablock_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.datablock_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[Datablock]**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_find_by_id**
> Datablock datablock_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.datablock_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_find_one**
> Datablock datablock_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.datablock_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_patch_or_create**
> Datablock datablock_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
data = swagger_client.Datablock() # Datablock | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.datablock_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Datablock**](Datablock.md)| Model instance data | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_prototype_get_dataset**
> Dataset datablock_prototype_get_dataset(id, refresh=refresh)

Fetches belongsTo relation dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Datablock id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation dataset.
    api_response = api_instance.datablock_prototype_get_dataset(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_prototype_get_dataset: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Datablock id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_prototype_patch_attributes**
> Datablock datablock_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Datablock id
data = swagger_client.Datablock() # Datablock | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.datablock_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Datablock id | 
 **data** | [**Datablock**](Datablock.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_replace_by_id_post_datablocksid_replace**
> Datablock datablock_replace_by_id_post_datablocksid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Model id
data = swagger_client.Datablock() # Datablock | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.datablock_replace_by_id_post_datablocksid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_replace_by_id_post_datablocksid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Datablock**](Datablock.md)| Model instance data | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_replace_by_id_put_datablocksid**
> Datablock datablock_replace_by_id_put_datablocksid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
id = 'id_example' # str | Model id
data = swagger_client.Datablock() # Datablock | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.datablock_replace_by_id_put_datablocksid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_replace_by_id_put_datablocksid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Datablock**](Datablock.md)| Model instance data | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_replace_or_create_post_datablocks_replace_or_create**
> Datablock datablock_replace_or_create_post_datablocks_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
data = swagger_client.Datablock() # Datablock | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.datablock_replace_or_create_post_datablocks_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_replace_or_create_post_datablocks_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Datablock**](Datablock.md)| Model instance data | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_replace_or_create_put_datablocks**
> Datablock datablock_replace_or_create_put_datablocks(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
data = swagger_client.Datablock() # Datablock | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.datablock_replace_or_create_put_datablocks(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_replace_or_create_put_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Datablock**](Datablock.md)| Model instance data | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_update_all**
> InlineResponse2002 datablock_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Datablock() # Datablock | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.datablock_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Datablock**](Datablock.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **datablock_upsert_with_where**
> Datablock datablock_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.DatablockApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Datablock() # Datablock | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.datablock_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling DatablockApi->datablock_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Datablock**](Datablock.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Datablock**](Datablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

