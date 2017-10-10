# swagger_client.UserIdentityApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**user_identity_count**](UserIdentityApi.md#user_identity_count) | **GET** /UserIdentities/count | Count instances of the model matched by where from the data source.
[**user_identity_create**](UserIdentityApi.md#user_identity_create) | **POST** /UserIdentities | Create a new instance of the model and persist it into the data source.
[**user_identity_create_change_stream_get_user_identities_change_stream**](UserIdentityApi.md#user_identity_create_change_stream_get_user_identities_change_stream) | **GET** /UserIdentities/change-stream | Create a change stream.
[**user_identity_create_change_stream_post_user_identities_change_stream**](UserIdentityApi.md#user_identity_create_change_stream_post_user_identities_change_stream) | **POST** /UserIdentities/change-stream | Create a change stream.
[**user_identity_delete_by_id**](UserIdentityApi.md#user_identity_delete_by_id) | **DELETE** /UserIdentities/{id} | Delete a model instance by {{id}} from the data source.
[**user_identity_exists_get_user_identitiesid_exists**](UserIdentityApi.md#user_identity_exists_get_user_identitiesid_exists) | **GET** /UserIdentities/{id}/exists | Check whether a model instance exists in the data source.
[**user_identity_exists_head_user_identitiesid**](UserIdentityApi.md#user_identity_exists_head_user_identitiesid) | **HEAD** /UserIdentities/{id} | Check whether a model instance exists in the data source.
[**user_identity_find**](UserIdentityApi.md#user_identity_find) | **GET** /UserIdentities | Find all instances of the model matched by filter from the data source.
[**user_identity_find_by_id**](UserIdentityApi.md#user_identity_find_by_id) | **GET** /UserIdentities/{id} | Find a model instance by {{id}} from the data source.
[**user_identity_find_one**](UserIdentityApi.md#user_identity_find_one) | **GET** /UserIdentities/findOne | Find first instance of the model matched by filter from the data source.
[**user_identity_patch_or_create**](UserIdentityApi.md#user_identity_patch_or_create) | **PATCH** /UserIdentities | Patch an existing model instance or insert a new one into the data source.
[**user_identity_prototype_get_user**](UserIdentityApi.md#user_identity_prototype_get_user) | **GET** /UserIdentities/{id}/user | Fetches belongsTo relation user.
[**user_identity_prototype_patch_attributes**](UserIdentityApi.md#user_identity_prototype_patch_attributes) | **PATCH** /UserIdentities/{id} | Patch attributes for a model instance and persist it into the data source.
[**user_identity_replace_by_id_post_user_identitiesid_replace**](UserIdentityApi.md#user_identity_replace_by_id_post_user_identitiesid_replace) | **POST** /UserIdentities/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**user_identity_replace_by_id_put_user_identitiesid**](UserIdentityApi.md#user_identity_replace_by_id_put_user_identitiesid) | **PUT** /UserIdentities/{id} | Replace attributes for a model instance and persist it into the data source.
[**user_identity_replace_or_create_post_user_identities_replace_or_create**](UserIdentityApi.md#user_identity_replace_or_create_post_user_identities_replace_or_create) | **POST** /UserIdentities/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**user_identity_replace_or_create_put_user_identities**](UserIdentityApi.md#user_identity_replace_or_create_put_user_identities) | **PUT** /UserIdentities | Replace an existing model instance or insert a new one into the data source.
[**user_identity_update_all**](UserIdentityApi.md#user_identity_update_all) | **POST** /UserIdentities/update | Update instances of the model matched by {{where}} from the data source.
[**user_identity_upsert_with_where**](UserIdentityApi.md#user_identity_upsert_with_where) | **POST** /UserIdentities/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **user_identity_count**
> InlineResponse200 user_identity_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.user_identity_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_count: %s\n" % e)
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

# **user_identity_create**
> UserIdentity user_identity_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
data = swagger_client.UserIdentity() # UserIdentity | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.user_identity_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserIdentity**](UserIdentity.md)| Model instance data | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_create_change_stream_get_user_identities_change_stream**
> file user_identity_create_change_stream_get_user_identities_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.user_identity_create_change_stream_get_user_identities_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_create_change_stream_get_user_identities_change_stream: %s\n" % e)
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

# **user_identity_create_change_stream_post_user_identities_change_stream**
> file user_identity_create_change_stream_post_user_identities_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.user_identity_create_change_stream_post_user_identities_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_create_change_stream_post_user_identities_change_stream: %s\n" % e)
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

# **user_identity_delete_by_id**
> object user_identity_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.user_identity_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_delete_by_id: %s\n" % e)
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

# **user_identity_exists_get_user_identitiesid_exists**
> InlineResponse2001 user_identity_exists_get_user_identitiesid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.user_identity_exists_get_user_identitiesid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_exists_get_user_identitiesid_exists: %s\n" % e)
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

# **user_identity_exists_head_user_identitiesid**
> InlineResponse2001 user_identity_exists_head_user_identitiesid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.user_identity_exists_head_user_identitiesid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_exists_head_user_identitiesid: %s\n" % e)
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

# **user_identity_find**
> list[UserIdentity] user_identity_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.user_identity_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[UserIdentity]**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_find_by_id**
> UserIdentity user_identity_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.user_identity_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_find_one**
> UserIdentity user_identity_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.user_identity_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_patch_or_create**
> UserIdentity user_identity_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
data = swagger_client.UserIdentity() # UserIdentity | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_identity_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserIdentity**](UserIdentity.md)| Model instance data | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_prototype_get_user**
> User user_identity_prototype_get_user(id, refresh=refresh)

Fetches belongsTo relation user.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | UserIdentity id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation user.
    api_response = api_instance.user_identity_prototype_get_user(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_prototype_get_user: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| UserIdentity id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_prototype_patch_attributes**
> UserIdentity user_identity_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | UserIdentity id
data = swagger_client.UserIdentity() # UserIdentity | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_identity_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| UserIdentity id | 
 **data** | [**UserIdentity**](UserIdentity.md)| An object of model property name/value pairs | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_replace_by_id_post_user_identitiesid_replace**
> UserIdentity user_identity_replace_by_id_post_user_identitiesid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | Model id
data = swagger_client.UserIdentity() # UserIdentity | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_identity_replace_by_id_post_user_identitiesid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_replace_by_id_post_user_identitiesid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**UserIdentity**](UserIdentity.md)| Model instance data | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_replace_by_id_put_user_identitiesid**
> UserIdentity user_identity_replace_by_id_put_user_identitiesid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
id = 'id_example' # str | Model id
data = swagger_client.UserIdentity() # UserIdentity | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_identity_replace_by_id_put_user_identitiesid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_replace_by_id_put_user_identitiesid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**UserIdentity**](UserIdentity.md)| Model instance data | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_replace_or_create_post_user_identities_replace_or_create**
> UserIdentity user_identity_replace_or_create_post_user_identities_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
data = swagger_client.UserIdentity() # UserIdentity | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_identity_replace_or_create_post_user_identities_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_replace_or_create_post_user_identities_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserIdentity**](UserIdentity.md)| Model instance data | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_replace_or_create_put_user_identities**
> UserIdentity user_identity_replace_or_create_put_user_identities(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
data = swagger_client.UserIdentity() # UserIdentity | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_identity_replace_or_create_put_user_identities(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_replace_or_create_put_user_identities: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserIdentity**](UserIdentity.md)| Model instance data | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_update_all**
> InlineResponse2002 user_identity_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.UserIdentity() # UserIdentity | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.user_identity_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**UserIdentity**](UserIdentity.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_identity_upsert_with_where**
> UserIdentity user_identity_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserIdentityApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.UserIdentity() # UserIdentity | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.user_identity_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserIdentityApi->user_identity_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**UserIdentity**](UserIdentity.md)| An object of model property name/value pairs | [optional] 

### Return type

[**UserIdentity**](UserIdentity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

