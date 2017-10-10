# swagger_client.AccessGroupApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**access_group_count**](AccessGroupApi.md#access_group_count) | **GET** /AccessGroups/count | Count instances of the model matched by where from the data source.
[**access_group_create**](AccessGroupApi.md#access_group_create) | **POST** /AccessGroups | Create a new instance of the model and persist it into the data source.
[**access_group_create_change_stream_get_access_groups_change_stream**](AccessGroupApi.md#access_group_create_change_stream_get_access_groups_change_stream) | **GET** /AccessGroups/change-stream | Create a change stream.
[**access_group_create_change_stream_post_access_groups_change_stream**](AccessGroupApi.md#access_group_create_change_stream_post_access_groups_change_stream) | **POST** /AccessGroups/change-stream | Create a change stream.
[**access_group_delete_by_id**](AccessGroupApi.md#access_group_delete_by_id) | **DELETE** /AccessGroups/{id} | Delete a model instance by {{id}} from the data source.
[**access_group_exists_get_access_groupsid_exists**](AccessGroupApi.md#access_group_exists_get_access_groupsid_exists) | **GET** /AccessGroups/{id}/exists | Check whether a model instance exists in the data source.
[**access_group_exists_head_access_groupsid**](AccessGroupApi.md#access_group_exists_head_access_groupsid) | **HEAD** /AccessGroups/{id} | Check whether a model instance exists in the data source.
[**access_group_find**](AccessGroupApi.md#access_group_find) | **GET** /AccessGroups | Find all instances of the model matched by filter from the data source.
[**access_group_find_by_id**](AccessGroupApi.md#access_group_find_by_id) | **GET** /AccessGroups/{id} | Find a model instance by {{id}} from the data source.
[**access_group_find_one**](AccessGroupApi.md#access_group_find_one) | **GET** /AccessGroups/findOne | Find first instance of the model matched by filter from the data source.
[**access_group_patch_or_create**](AccessGroupApi.md#access_group_patch_or_create) | **PATCH** /AccessGroups | Patch an existing model instance or insert a new one into the data source.
[**access_group_prototype_patch_attributes**](AccessGroupApi.md#access_group_prototype_patch_attributes) | **PATCH** /AccessGroups/{id} | Patch attributes for a model instance and persist it into the data source.
[**access_group_replace_by_id_post_access_groupsid_replace**](AccessGroupApi.md#access_group_replace_by_id_post_access_groupsid_replace) | **POST** /AccessGroups/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**access_group_replace_by_id_put_access_groupsid**](AccessGroupApi.md#access_group_replace_by_id_put_access_groupsid) | **PUT** /AccessGroups/{id} | Replace attributes for a model instance and persist it into the data source.
[**access_group_replace_or_create_post_access_groups_replace_or_create**](AccessGroupApi.md#access_group_replace_or_create_post_access_groups_replace_or_create) | **POST** /AccessGroups/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**access_group_replace_or_create_put_access_groups**](AccessGroupApi.md#access_group_replace_or_create_put_access_groups) | **PUT** /AccessGroups | Replace an existing model instance or insert a new one into the data source.
[**access_group_update_all**](AccessGroupApi.md#access_group_update_all) | **POST** /AccessGroups/update | Update instances of the model matched by {{where}} from the data source.
[**access_group_upsert_with_where**](AccessGroupApi.md#access_group_upsert_with_where) | **POST** /AccessGroups/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **access_group_count**
> InlineResponse200 access_group_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.access_group_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_count: %s\n" % e)
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

# **access_group_create**
> AccessGroup access_group_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
data = swagger_client.AccessGroup() # AccessGroup | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.access_group_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessGroup**](AccessGroup.md)| Model instance data | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_create_change_stream_get_access_groups_change_stream**
> file access_group_create_change_stream_get_access_groups_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.access_group_create_change_stream_get_access_groups_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_create_change_stream_get_access_groups_change_stream: %s\n" % e)
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

# **access_group_create_change_stream_post_access_groups_change_stream**
> file access_group_create_change_stream_post_access_groups_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.access_group_create_change_stream_post_access_groups_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_create_change_stream_post_access_groups_change_stream: %s\n" % e)
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

# **access_group_delete_by_id**
> object access_group_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.access_group_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_delete_by_id: %s\n" % e)
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

# **access_group_exists_get_access_groupsid_exists**
> InlineResponse2001 access_group_exists_get_access_groupsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.access_group_exists_get_access_groupsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_exists_get_access_groupsid_exists: %s\n" % e)
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

# **access_group_exists_head_access_groupsid**
> InlineResponse2001 access_group_exists_head_access_groupsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.access_group_exists_head_access_groupsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_exists_head_access_groupsid: %s\n" % e)
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

# **access_group_find**
> list[AccessGroup] access_group_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.access_group_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[AccessGroup]**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_find_by_id**
> AccessGroup access_group_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.access_group_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_find_one**
> AccessGroup access_group_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.access_group_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_patch_or_create**
> AccessGroup access_group_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
data = swagger_client.AccessGroup() # AccessGroup | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.access_group_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessGroup**](AccessGroup.md)| Model instance data | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_prototype_patch_attributes**
> AccessGroup access_group_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | AccessGroup id
data = swagger_client.AccessGroup() # AccessGroup | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.access_group_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| AccessGroup id | 
 **data** | [**AccessGroup**](AccessGroup.md)| An object of model property name/value pairs | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_replace_by_id_post_access_groupsid_replace**
> AccessGroup access_group_replace_by_id_post_access_groupsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | Model id
data = swagger_client.AccessGroup() # AccessGroup | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.access_group_replace_by_id_post_access_groupsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_replace_by_id_post_access_groupsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**AccessGroup**](AccessGroup.md)| Model instance data | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_replace_by_id_put_access_groupsid**
> AccessGroup access_group_replace_by_id_put_access_groupsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
id = 'id_example' # str | Model id
data = swagger_client.AccessGroup() # AccessGroup | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.access_group_replace_by_id_put_access_groupsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_replace_by_id_put_access_groupsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**AccessGroup**](AccessGroup.md)| Model instance data | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_replace_or_create_post_access_groups_replace_or_create**
> AccessGroup access_group_replace_or_create_post_access_groups_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
data = swagger_client.AccessGroup() # AccessGroup | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.access_group_replace_or_create_post_access_groups_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_replace_or_create_post_access_groups_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessGroup**](AccessGroup.md)| Model instance data | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_replace_or_create_put_access_groups**
> AccessGroup access_group_replace_or_create_put_access_groups(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
data = swagger_client.AccessGroup() # AccessGroup | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.access_group_replace_or_create_put_access_groups(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_replace_or_create_put_access_groups: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**AccessGroup**](AccessGroup.md)| Model instance data | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_update_all**
> InlineResponse2002 access_group_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.AccessGroup() # AccessGroup | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.access_group_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**AccessGroup**](AccessGroup.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **access_group_upsert_with_where**
> AccessGroup access_group_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.AccessGroupApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.AccessGroup() # AccessGroup | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.access_group_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccessGroupApi->access_group_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**AccessGroup**](AccessGroup.md)| An object of model property name/value pairs | [optional] 

### Return type

[**AccessGroup**](AccessGroup.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

