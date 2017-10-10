# swagger_client.SynchTimesApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**synch_times_count**](SynchTimesApi.md#synch_times_count) | **GET** /SynchTimes/count | Count instances of the model matched by where from the data source.
[**synch_times_create**](SynchTimesApi.md#synch_times_create) | **POST** /SynchTimes | Create a new instance of the model and persist it into the data source.
[**synch_times_create_change_stream_get_synch_times_change_stream**](SynchTimesApi.md#synch_times_create_change_stream_get_synch_times_change_stream) | **GET** /SynchTimes/change-stream | Create a change stream.
[**synch_times_create_change_stream_post_synch_times_change_stream**](SynchTimesApi.md#synch_times_create_change_stream_post_synch_times_change_stream) | **POST** /SynchTimes/change-stream | Create a change stream.
[**synch_times_delete_by_id**](SynchTimesApi.md#synch_times_delete_by_id) | **DELETE** /SynchTimes/{id} | Delete a model instance by {{id}} from the data source.
[**synch_times_exists_get_synch_timesid_exists**](SynchTimesApi.md#synch_times_exists_get_synch_timesid_exists) | **GET** /SynchTimes/{id}/exists | Check whether a model instance exists in the data source.
[**synch_times_exists_head_synch_timesid**](SynchTimesApi.md#synch_times_exists_head_synch_timesid) | **HEAD** /SynchTimes/{id} | Check whether a model instance exists in the data source.
[**synch_times_find**](SynchTimesApi.md#synch_times_find) | **GET** /SynchTimes | Find all instances of the model matched by filter from the data source.
[**synch_times_find_by_id**](SynchTimesApi.md#synch_times_find_by_id) | **GET** /SynchTimes/{id} | Find a model instance by {{id}} from the data source.
[**synch_times_find_one**](SynchTimesApi.md#synch_times_find_one) | **GET** /SynchTimes/findOne | Find first instance of the model matched by filter from the data source.
[**synch_times_patch_or_create**](SynchTimesApi.md#synch_times_patch_or_create) | **PATCH** /SynchTimes | Patch an existing model instance or insert a new one into the data source.
[**synch_times_prototype_patch_attributes**](SynchTimesApi.md#synch_times_prototype_patch_attributes) | **PATCH** /SynchTimes/{id} | Patch attributes for a model instance and persist it into the data source.
[**synch_times_replace_by_id_post_synch_timesid_replace**](SynchTimesApi.md#synch_times_replace_by_id_post_synch_timesid_replace) | **POST** /SynchTimes/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**synch_times_replace_by_id_put_synch_timesid**](SynchTimesApi.md#synch_times_replace_by_id_put_synch_timesid) | **PUT** /SynchTimes/{id} | Replace attributes for a model instance and persist it into the data source.
[**synch_times_replace_or_create_post_synch_times_replace_or_create**](SynchTimesApi.md#synch_times_replace_or_create_post_synch_times_replace_or_create) | **POST** /SynchTimes/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**synch_times_replace_or_create_put_synch_times**](SynchTimesApi.md#synch_times_replace_or_create_put_synch_times) | **PUT** /SynchTimes | Replace an existing model instance or insert a new one into the data source.
[**synch_times_update_all**](SynchTimesApi.md#synch_times_update_all) | **POST** /SynchTimes/update | Update instances of the model matched by {{where}} from the data source.
[**synch_times_upsert_with_where**](SynchTimesApi.md#synch_times_upsert_with_where) | **POST** /SynchTimes/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **synch_times_count**
> InlineResponse200 synch_times_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.synch_times_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_count: %s\n" % e)
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

# **synch_times_create**
> SynchTimes synch_times_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
data = swagger_client.SynchTimes() # SynchTimes | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.synch_times_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**SynchTimes**](SynchTimes.md)| Model instance data | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_create_change_stream_get_synch_times_change_stream**
> file synch_times_create_change_stream_get_synch_times_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.synch_times_create_change_stream_get_synch_times_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_create_change_stream_get_synch_times_change_stream: %s\n" % e)
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

# **synch_times_create_change_stream_post_synch_times_change_stream**
> file synch_times_create_change_stream_post_synch_times_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.synch_times_create_change_stream_post_synch_times_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_create_change_stream_post_synch_times_change_stream: %s\n" % e)
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

# **synch_times_delete_by_id**
> object synch_times_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.synch_times_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_delete_by_id: %s\n" % e)
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

# **synch_times_exists_get_synch_timesid_exists**
> InlineResponse2001 synch_times_exists_get_synch_timesid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.synch_times_exists_get_synch_timesid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_exists_get_synch_timesid_exists: %s\n" % e)
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

# **synch_times_exists_head_synch_timesid**
> InlineResponse2001 synch_times_exists_head_synch_timesid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.synch_times_exists_head_synch_timesid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_exists_head_synch_timesid: %s\n" % e)
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

# **synch_times_find**
> list[SynchTimes] synch_times_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.synch_times_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[SynchTimes]**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_find_by_id**
> SynchTimes synch_times_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.synch_times_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_find_one**
> SynchTimes synch_times_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.synch_times_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_patch_or_create**
> SynchTimes synch_times_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
data = swagger_client.SynchTimes() # SynchTimes | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.synch_times_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**SynchTimes**](SynchTimes.md)| Model instance data | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_prototype_patch_attributes**
> SynchTimes synch_times_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | SynchTimes id
data = swagger_client.SynchTimes() # SynchTimes | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.synch_times_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| SynchTimes id | 
 **data** | [**SynchTimes**](SynchTimes.md)| An object of model property name/value pairs | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_replace_by_id_post_synch_timesid_replace**
> SynchTimes synch_times_replace_by_id_post_synch_timesid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | Model id
data = swagger_client.SynchTimes() # SynchTimes | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.synch_times_replace_by_id_post_synch_timesid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_replace_by_id_post_synch_timesid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**SynchTimes**](SynchTimes.md)| Model instance data | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_replace_by_id_put_synch_timesid**
> SynchTimes synch_times_replace_by_id_put_synch_timesid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
id = 'id_example' # str | Model id
data = swagger_client.SynchTimes() # SynchTimes | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.synch_times_replace_by_id_put_synch_timesid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_replace_by_id_put_synch_timesid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**SynchTimes**](SynchTimes.md)| Model instance data | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_replace_or_create_post_synch_times_replace_or_create**
> SynchTimes synch_times_replace_or_create_post_synch_times_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
data = swagger_client.SynchTimes() # SynchTimes | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.synch_times_replace_or_create_post_synch_times_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_replace_or_create_post_synch_times_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**SynchTimes**](SynchTimes.md)| Model instance data | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_replace_or_create_put_synch_times**
> SynchTimes synch_times_replace_or_create_put_synch_times(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
data = swagger_client.SynchTimes() # SynchTimes | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.synch_times_replace_or_create_put_synch_times(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_replace_or_create_put_synch_times: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**SynchTimes**](SynchTimes.md)| Model instance data | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_update_all**
> InlineResponse2002 synch_times_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.SynchTimes() # SynchTimes | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.synch_times_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**SynchTimes**](SynchTimes.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **synch_times_upsert_with_where**
> SynchTimes synch_times_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SynchTimesApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.SynchTimes() # SynchTimes | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.synch_times_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SynchTimesApi->synch_times_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**SynchTimes**](SynchTimes.md)| An object of model property name/value pairs | [optional] 

### Return type

[**SynchTimes**](SynchTimes.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

