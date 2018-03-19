# swagger_client.PolicyApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**policy_count**](PolicyApi.md#policy_count) | **GET** /Policies/count | Count instances of the model matched by where from the data source.
[**policy_create**](PolicyApi.md#policy_create) | **POST** /Policies | Create a new instance of the model and persist it into the data source.
[**policy_create_change_stream_get_policies_change_stream**](PolicyApi.md#policy_create_change_stream_get_policies_change_stream) | **GET** /Policies/change-stream | Create a change stream.
[**policy_create_change_stream_post_policies_change_stream**](PolicyApi.md#policy_create_change_stream_post_policies_change_stream) | **POST** /Policies/change-stream | Create a change stream.
[**policy_delete_by_id**](PolicyApi.md#policy_delete_by_id) | **DELETE** /Policies/{id} | Delete a model instance by {{id}} from the data source.
[**policy_exists_get_policiesid_exists**](PolicyApi.md#policy_exists_get_policiesid_exists) | **GET** /Policies/{id}/exists | Check whether a model instance exists in the data source.
[**policy_exists_head_policiesid**](PolicyApi.md#policy_exists_head_policiesid) | **HEAD** /Policies/{id} | Check whether a model instance exists in the data source.
[**policy_find**](PolicyApi.md#policy_find) | **GET** /Policies | Find all instances of the model matched by filter from the data source.
[**policy_find_by_id**](PolicyApi.md#policy_find_by_id) | **GET** /Policies/{id} | Find a model instance by {{id}} from the data source.
[**policy_find_one**](PolicyApi.md#policy_find_one) | **GET** /Policies/findOne | Find first instance of the model matched by filter from the data source.
[**policy_is_valid**](PolicyApi.md#policy_is_valid) | **POST** /Policies/isValid | Check if data is valid according to a schema
[**policy_patch_or_create**](PolicyApi.md#policy_patch_or_create) | **PATCH** /Policies | Patch an existing model instance or insert a new one into the data source.
[**policy_prototype_patch_attributes**](PolicyApi.md#policy_prototype_patch_attributes) | **PATCH** /Policies/{id} | Patch attributes for a model instance and persist it into the data source.
[**policy_replace_by_id_post_policiesid_replace**](PolicyApi.md#policy_replace_by_id_post_policiesid_replace) | **POST** /Policies/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**policy_replace_by_id_put_policiesid**](PolicyApi.md#policy_replace_by_id_put_policiesid) | **PUT** /Policies/{id} | Replace attributes for a model instance and persist it into the data source.
[**policy_replace_or_create_post_policies_replace_or_create**](PolicyApi.md#policy_replace_or_create_post_policies_replace_or_create) | **POST** /Policies/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**policy_replace_or_create_put_policies**](PolicyApi.md#policy_replace_or_create_put_policies) | **PUT** /Policies | Replace an existing model instance or insert a new one into the data source.
[**policy_update_all**](PolicyApi.md#policy_update_all) | **POST** /Policies/update | Update instances of the model matched by {{where}} from the data source.
[**policy_upsert_with_where**](PolicyApi.md#policy_upsert_with_where) | **POST** /Policies/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **policy_count**
> InlineResponse200 policy_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.policy_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_count: %s\n" % e)
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

# **policy_create**
> Policy policy_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
data = swagger_client.Policy() # Policy | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.policy_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Policy**](Policy.md)| Model instance data | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_create_change_stream_get_policies_change_stream**
> file policy_create_change_stream_get_policies_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.policy_create_change_stream_get_policies_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_create_change_stream_get_policies_change_stream: %s\n" % e)
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

# **policy_create_change_stream_post_policies_change_stream**
> file policy_create_change_stream_post_policies_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.policy_create_change_stream_post_policies_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_create_change_stream_post_policies_change_stream: %s\n" % e)
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

# **policy_delete_by_id**
> object policy_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.policy_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_delete_by_id: %s\n" % e)
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

# **policy_exists_get_policiesid_exists**
> InlineResponse2001 policy_exists_get_policiesid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.policy_exists_get_policiesid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_exists_get_policiesid_exists: %s\n" % e)
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

# **policy_exists_head_policiesid**
> InlineResponse2001 policy_exists_head_policiesid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.policy_exists_head_policiesid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_exists_head_policiesid: %s\n" % e)
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

# **policy_find**
> list[Policy] policy_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.policy_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[Policy]**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_find_by_id**
> Policy policy_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.policy_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_find_one**
> Policy policy_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.policy_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_is_valid**
> XAny policy_is_valid(ownableItem=ownableItem)

Check if data is valid according to a schema

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
ownableItem = NULL # object |  (optional)

try: 
    # Check if data is valid according to a schema
    api_response = api_instance.policy_is_valid(ownableItem=ownableItem)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_is_valid: %s\n" % e)
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

# **policy_patch_or_create**
> Policy policy_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
data = swagger_client.Policy() # Policy | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.policy_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Policy**](Policy.md)| Model instance data | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_prototype_patch_attributes**
> Policy policy_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Policy id
data = swagger_client.Policy() # Policy | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.policy_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Policy id | 
 **data** | [**Policy**](Policy.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_replace_by_id_post_policiesid_replace**
> Policy policy_replace_by_id_post_policiesid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Model id
data = swagger_client.Policy() # Policy | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.policy_replace_by_id_post_policiesid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_replace_by_id_post_policiesid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Policy**](Policy.md)| Model instance data | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_replace_by_id_put_policiesid**
> Policy policy_replace_by_id_put_policiesid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
id = 'id_example' # str | Model id
data = swagger_client.Policy() # Policy | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.policy_replace_by_id_put_policiesid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_replace_by_id_put_policiesid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Policy**](Policy.md)| Model instance data | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_replace_or_create_post_policies_replace_or_create**
> Policy policy_replace_or_create_post_policies_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
data = swagger_client.Policy() # Policy | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.policy_replace_or_create_post_policies_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_replace_or_create_post_policies_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Policy**](Policy.md)| Model instance data | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_replace_or_create_put_policies**
> Policy policy_replace_or_create_put_policies(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
data = swagger_client.Policy() # Policy | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.policy_replace_or_create_put_policies(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_replace_or_create_put_policies: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Policy**](Policy.md)| Model instance data | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_update_all**
> InlineResponse2002 policy_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Policy() # Policy | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.policy_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Policy**](Policy.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **policy_upsert_with_where**
> Policy policy_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PolicyApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Policy() # Policy | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.policy_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PolicyApi->policy_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Policy**](Policy.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Policy**](Policy.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

