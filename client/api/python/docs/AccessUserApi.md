# swagger_client.AccessUserApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**access_user_count**](AccessUserApi.md#access_user_count) | **GET** /AccessUsers/count | Count instances of the model matched by where from the data source.
[**access_user_create**](AccessUserApi.md#access_user_create) | **POST** /AccessUsers | Create a new instance of the model and persist it into the data source.
[**access_user_create_change_stream_get_access_users_change_stream**](AccessUserApi.md#access_user_create_change_stream_get_access_users_change_stream) | **GET** /AccessUsers/change-stream | Create a change stream.
[**access_user_create_change_stream_post_access_users_change_stream**](AccessUserApi.md#access_user_create_change_stream_post_access_users_change_stream) | **POST** /AccessUsers/change-stream | Create a change stream.
[**access_user_delete_by_id**](AccessUserApi.md#access_user_delete_by_id) | **DELETE** /AccessUsers/{id} | Delete a model instance by {{id}} from the data source.
[**access_user_exists_get_access_usersid_exists**](AccessUserApi.md#access_user_exists_get_access_usersid_exists) | **GET** /AccessUsers/{id}/exists | Check whether a model instance exists in the data source.
[**access_user_exists_head_access_usersid**](AccessUserApi.md#access_user_exists_head_access_usersid) | **HEAD** /AccessUsers/{id} | Check whether a model instance exists in the data source.
[**access_user_find**](AccessUserApi.md#access_user_find) | **GET** /AccessUsers | Find all instances of the model matched by filter from the data source.
[**access_user_find_by_id**](AccessUserApi.md#access_user_find_by_id) | **GET** /AccessUsers/{id} | Find a model instance by {{id}} from the data source.
[**access_user_find_one**](AccessUserApi.md#access_user_find_one) | **GET** /AccessUsers/findOne | Find first instance of the model matched by filter from the data source.
[**access_user_patch_or_create**](AccessUserApi.md#access_user_patch_or_create) | **PATCH** /AccessUsers | Patch an existing model instance or insert a new one into the data source.
[**access_user_prototype_patch_attributes**](AccessUserApi.md#access_user_prototype_patch_attributes) | **PATCH** /AccessUsers/{id} | Patch attributes for a model instance and persist it into the data source.
[**access_user_replace_by_id_post_access_usersid_replace**](AccessUserApi.md#access_user_replace_by_id_post_access_usersid_replace) | **POST** /AccessUsers/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**access_user_replace_by_id_put_access_usersid**](AccessUserApi.md#access_user_replace_by_id_put_access_usersid) | **PUT** /AccessUsers/{id} | Replace attributes for a model instance and persist it into the data source.
[**access_user_replace_or_create_post_access_users_replace_or_create**](AccessUserApi.md#access_user_replace_or_create_post_access_users_replace_or_create) | **POST** /AccessUsers/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**access_user_replace_or_create_put_access_users**](AccessUserApi.md#access_user_replace_or_create_put_access_users) | **PUT** /AccessUsers | Replace an existing model instance or insert a new one into the data source.
[**access_user_update_all**](AccessUserApi.md#access_user_update_all) | **POST** /AccessUsers/update | Update instances of the model matched by {{where}} from the data source.
[**access_user_upsert_with_where**](AccessUserApi.md#access_user_upsert_with_where) | **POST** /AccessUsers/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **access_user_count**
> InlineResponse200 access_user_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.access_user_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_count: %s\n" % e)
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

# **access_user_create**
> AccessUser access_user_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
data = swagger_client.AccessUser() # AccessUser | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.access_user_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessUser**](AccessUser.md)| Model instance data | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_create_change_stream_get_access_users_change_stream**
> file access_user_create_change_stream_get_access_users_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.access_user_create_change_stream_get_access_users_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_create_change_stream_get_access_users_change_stream: %s\n" % e)
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

# **access_user_create_change_stream_post_access_users_change_stream**
> file access_user_create_change_stream_post_access_users_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.access_user_create_change_stream_post_access_users_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_create_change_stream_post_access_users_change_stream: %s\n" % e)
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

# **access_user_delete_by_id**
> object access_user_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.access_user_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_delete_by_id: %s\n" % e)
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

# **access_user_exists_get_access_usersid_exists**
> InlineResponse2001 access_user_exists_get_access_usersid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.access_user_exists_get_access_usersid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_exists_get_access_usersid_exists: %s\n" % e)
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

# **access_user_exists_head_access_usersid**
> InlineResponse2001 access_user_exists_head_access_usersid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.access_user_exists_head_access_usersid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_exists_head_access_usersid: %s\n" % e)
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

# **access_user_find**
> list[AccessUser] access_user_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.access_user_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[AccessUser]**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_find_by_id**
> AccessUser access_user_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.access_user_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_find_one**
> AccessUser access_user_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.access_user_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_patch_or_create**
> AccessUser access_user_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
data = swagger_client.AccessUser() # AccessUser | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.access_user_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessUser**](AccessUser.md)| Model instance data | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_prototype_patch_attributes**
> AccessUser access_user_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | AccessUser id
data = swagger_client.AccessUser() # AccessUser | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.access_user_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| AccessUser id | 
 **data** | [**AccessUser**](AccessUser.md)| An object of model property name/value pairs | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_replace_by_id_post_access_usersid_replace**
> AccessUser access_user_replace_by_id_post_access_usersid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | Model id
data = swagger_client.AccessUser() # AccessUser | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.access_user_replace_by_id_post_access_usersid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_replace_by_id_post_access_usersid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**AccessUser**](AccessUser.md)| Model instance data | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_replace_by_id_put_access_usersid**
> AccessUser access_user_replace_by_id_put_access_usersid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
id = 'id_example' # str | Model id
data = swagger_client.AccessUser() # AccessUser | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.access_user_replace_by_id_put_access_usersid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_replace_by_id_put_access_usersid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**AccessUser**](AccessUser.md)| Model instance data | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_replace_or_create_post_access_users_replace_or_create**
> AccessUser access_user_replace_or_create_post_access_users_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
data = swagger_client.AccessUser() # AccessUser | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.access_user_replace_or_create_post_access_users_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_replace_or_create_post_access_users_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessUser**](AccessUser.md)| Model instance data | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_replace_or_create_put_access_users**
> AccessUser access_user_replace_or_create_put_access_users(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
data = swagger_client.AccessUser() # AccessUser | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.access_user_replace_or_create_put_access_users(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_replace_or_create_put_access_users: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessUser**](AccessUser.md)| Model instance data | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_update_all**
> InlineResponse2002 access_user_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.AccessUser() # AccessUser | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.access_user_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**AccessUser**](AccessUser.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_user_upsert_with_where**
> AccessUser access_user_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessUserApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.AccessUser() # AccessUser | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.access_user_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessUserApi->access_user_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**AccessUser**](AccessUser.md)| An object of model property name/value pairs | [optional] 

### Return type

[**AccessUser**](AccessUser.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

