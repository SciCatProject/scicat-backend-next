# swagger_client.OrigDatablockApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**orig_datablock_count**](OrigDatablockApi.md#orig_datablock_count) | **GET** /OrigDatablocks/count | Count instances of the model matched by where from the data source.
[**orig_datablock_create**](OrigDatablockApi.md#orig_datablock_create) | **POST** /OrigDatablocks | Create a new instance of the model and persist it into the data source.
[**orig_datablock_create_change_stream_get_orig_datablocks_change_stream**](OrigDatablockApi.md#orig_datablock_create_change_stream_get_orig_datablocks_change_stream) | **GET** /OrigDatablocks/change-stream | Create a change stream.
[**orig_datablock_create_change_stream_post_orig_datablocks_change_stream**](OrigDatablockApi.md#orig_datablock_create_change_stream_post_orig_datablocks_change_stream) | **POST** /OrigDatablocks/change-stream | Create a change stream.
[**orig_datablock_delete_by_id**](OrigDatablockApi.md#orig_datablock_delete_by_id) | **DELETE** /OrigDatablocks/{id} | Delete a model instance by {{id}} from the data source.
[**orig_datablock_exists_get_orig_datablocksid_exists**](OrigDatablockApi.md#orig_datablock_exists_get_orig_datablocksid_exists) | **GET** /OrigDatablocks/{id}/exists | Check whether a model instance exists in the data source.
[**orig_datablock_exists_head_orig_datablocksid**](OrigDatablockApi.md#orig_datablock_exists_head_orig_datablocksid) | **HEAD** /OrigDatablocks/{id} | Check whether a model instance exists in the data source.
[**orig_datablock_find**](OrigDatablockApi.md#orig_datablock_find) | **GET** /OrigDatablocks | Find all instances of the model matched by filter from the data source.
[**orig_datablock_find_by_id**](OrigDatablockApi.md#orig_datablock_find_by_id) | **GET** /OrigDatablocks/{id} | Find a model instance by {{id}} from the data source.
[**orig_datablock_find_one**](OrigDatablockApi.md#orig_datablock_find_one) | **GET** /OrigDatablocks/findOne | Find first instance of the model matched by filter from the data source.
[**orig_datablock_is_valid**](OrigDatablockApi.md#orig_datablock_is_valid) | **POST** /OrigDatablocks/isValid | Check if data is valid according to a schema
[**orig_datablock_patch_or_create**](OrigDatablockApi.md#orig_datablock_patch_or_create) | **PATCH** /OrigDatablocks | Patch an existing model instance or insert a new one into the data source.
[**orig_datablock_prototype_get_dataset**](OrigDatablockApi.md#orig_datablock_prototype_get_dataset) | **GET** /OrigDatablocks/{id}/dataset | Fetches belongsTo relation dataset.
[**orig_datablock_prototype_patch_attributes**](OrigDatablockApi.md#orig_datablock_prototype_patch_attributes) | **PATCH** /OrigDatablocks/{id} | Patch attributes for a model instance and persist it into the data source.
[**orig_datablock_replace_by_id_post_orig_datablocksid_replace**](OrigDatablockApi.md#orig_datablock_replace_by_id_post_orig_datablocksid_replace) | **POST** /OrigDatablocks/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**orig_datablock_replace_by_id_put_orig_datablocksid**](OrigDatablockApi.md#orig_datablock_replace_by_id_put_orig_datablocksid) | **PUT** /OrigDatablocks/{id} | Replace attributes for a model instance and persist it into the data source.
[**orig_datablock_replace_or_create_post_orig_datablocks_replace_or_create**](OrigDatablockApi.md#orig_datablock_replace_or_create_post_orig_datablocks_replace_or_create) | **POST** /OrigDatablocks/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**orig_datablock_replace_or_create_put_orig_datablocks**](OrigDatablockApi.md#orig_datablock_replace_or_create_put_orig_datablocks) | **PUT** /OrigDatablocks | Replace an existing model instance or insert a new one into the data source.
[**orig_datablock_update_all**](OrigDatablockApi.md#orig_datablock_update_all) | **POST** /OrigDatablocks/update | Update instances of the model matched by {{where}} from the data source.
[**orig_datablock_upsert_with_where**](OrigDatablockApi.md#orig_datablock_upsert_with_where) | **POST** /OrigDatablocks/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **orig_datablock_count**
> InlineResponse200 orig_datablock_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.orig_datablock_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_count: %s\n" % e)
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

# **orig_datablock_create**
> OrigDatablock orig_datablock_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
data = swagger_client.OrigDatablock() # OrigDatablock | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.orig_datablock_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**OrigDatablock**](OrigDatablock.md)| Model instance data | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_create_change_stream_get_orig_datablocks_change_stream**
> file orig_datablock_create_change_stream_get_orig_datablocks_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.orig_datablock_create_change_stream_get_orig_datablocks_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_create_change_stream_get_orig_datablocks_change_stream: %s\n" % e)
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

# **orig_datablock_create_change_stream_post_orig_datablocks_change_stream**
> file orig_datablock_create_change_stream_post_orig_datablocks_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.orig_datablock_create_change_stream_post_orig_datablocks_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_create_change_stream_post_orig_datablocks_change_stream: %s\n" % e)
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

# **orig_datablock_delete_by_id**
> object orig_datablock_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.orig_datablock_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_delete_by_id: %s\n" % e)
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

# **orig_datablock_exists_get_orig_datablocksid_exists**
> InlineResponse2001 orig_datablock_exists_get_orig_datablocksid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.orig_datablock_exists_get_orig_datablocksid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_exists_get_orig_datablocksid_exists: %s\n" % e)
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

# **orig_datablock_exists_head_orig_datablocksid**
> InlineResponse2001 orig_datablock_exists_head_orig_datablocksid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.orig_datablock_exists_head_orig_datablocksid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_exists_head_orig_datablocksid: %s\n" % e)
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

# **orig_datablock_find**
> list[OrigDatablock] orig_datablock_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.orig_datablock_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[OrigDatablock]**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_find_by_id**
> OrigDatablock orig_datablock_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.orig_datablock_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_find_one**
> OrigDatablock orig_datablock_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.orig_datablock_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_is_valid**
> XAny orig_datablock_is_valid(ownableItem=ownableItem)

Check if data is valid according to a schema

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
ownableItem = NULL # object |  (optional)

try: 
    # Check if data is valid according to a schema
    api_response = api_instance.orig_datablock_is_valid(ownableItem=ownableItem)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_is_valid: %s\n" % e)
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

# **orig_datablock_patch_or_create**
> OrigDatablock orig_datablock_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
data = swagger_client.OrigDatablock() # OrigDatablock | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.orig_datablock_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**OrigDatablock**](OrigDatablock.md)| Model instance data | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_prototype_get_dataset**
> Dataset orig_datablock_prototype_get_dataset(id, refresh=refresh)

Fetches belongsTo relation dataset.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | OrigDatablock id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation dataset.
    api_response = api_instance.orig_datablock_prototype_get_dataset(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_prototype_get_dataset: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| OrigDatablock id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**Dataset**](Dataset.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_prototype_patch_attributes**
> OrigDatablock orig_datablock_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | OrigDatablock id
data = swagger_client.OrigDatablock() # OrigDatablock | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.orig_datablock_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| OrigDatablock id | 
 **data** | [**OrigDatablock**](OrigDatablock.md)| An object of model property name/value pairs | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_replace_by_id_post_orig_datablocksid_replace**
> OrigDatablock orig_datablock_replace_by_id_post_orig_datablocksid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | Model id
data = swagger_client.OrigDatablock() # OrigDatablock | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.orig_datablock_replace_by_id_post_orig_datablocksid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_replace_by_id_post_orig_datablocksid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**OrigDatablock**](OrigDatablock.md)| Model instance data | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_replace_by_id_put_orig_datablocksid**
> OrigDatablock orig_datablock_replace_by_id_put_orig_datablocksid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
id = 'id_example' # str | Model id
data = swagger_client.OrigDatablock() # OrigDatablock | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.orig_datablock_replace_by_id_put_orig_datablocksid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_replace_by_id_put_orig_datablocksid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**OrigDatablock**](OrigDatablock.md)| Model instance data | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_replace_or_create_post_orig_datablocks_replace_or_create**
> OrigDatablock orig_datablock_replace_or_create_post_orig_datablocks_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
data = swagger_client.OrigDatablock() # OrigDatablock | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.orig_datablock_replace_or_create_post_orig_datablocks_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_replace_or_create_post_orig_datablocks_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**OrigDatablock**](OrigDatablock.md)| Model instance data | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_replace_or_create_put_orig_datablocks**
> OrigDatablock orig_datablock_replace_or_create_put_orig_datablocks(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
data = swagger_client.OrigDatablock() # OrigDatablock | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.orig_datablock_replace_or_create_put_orig_datablocks(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_replace_or_create_put_orig_datablocks: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**OrigDatablock**](OrigDatablock.md)| Model instance data | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_update_all**
> InlineResponse2002 orig_datablock_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.OrigDatablock() # OrigDatablock | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.orig_datablock_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**OrigDatablock**](OrigDatablock.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orig_datablock_upsert_with_where**
> OrigDatablock orig_datablock_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OrigDatablockApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.OrigDatablock() # OrigDatablock | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.orig_datablock_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OrigDatablockApi->orig_datablock_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**OrigDatablock**](OrigDatablock.md)| An object of model property name/value pairs | [optional] 

### Return type

[**OrigDatablock**](OrigDatablock.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

