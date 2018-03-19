# swagger_client.UserCredentialApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**user_credential_count**](UserCredentialApi.md#user_credential_count) | **GET** /UserCredentials/count | Count instances of the model matched by where from the data source.
[**user_credential_create**](UserCredentialApi.md#user_credential_create) | **POST** /UserCredentials | Create a new instance of the model and persist it into the data source.
[**user_credential_create_change_stream_get_user_credentials_change_stream**](UserCredentialApi.md#user_credential_create_change_stream_get_user_credentials_change_stream) | **GET** /UserCredentials/change-stream | Create a change stream.
[**user_credential_create_change_stream_post_user_credentials_change_stream**](UserCredentialApi.md#user_credential_create_change_stream_post_user_credentials_change_stream) | **POST** /UserCredentials/change-stream | Create a change stream.
[**user_credential_delete_by_id**](UserCredentialApi.md#user_credential_delete_by_id) | **DELETE** /UserCredentials/{id} | Delete a model instance by {{id}} from the data source.
[**user_credential_exists_get_user_credentialsid_exists**](UserCredentialApi.md#user_credential_exists_get_user_credentialsid_exists) | **GET** /UserCredentials/{id}/exists | Check whether a model instance exists in the data source.
[**user_credential_exists_head_user_credentialsid**](UserCredentialApi.md#user_credential_exists_head_user_credentialsid) | **HEAD** /UserCredentials/{id} | Check whether a model instance exists in the data source.
[**user_credential_find**](UserCredentialApi.md#user_credential_find) | **GET** /UserCredentials | Find all instances of the model matched by filter from the data source.
[**user_credential_find_by_id**](UserCredentialApi.md#user_credential_find_by_id) | **GET** /UserCredentials/{id} | Find a model instance by {{id}} from the data source.
[**user_credential_find_one**](UserCredentialApi.md#user_credential_find_one) | **GET** /UserCredentials/findOne | Find first instance of the model matched by filter from the data source.
[**user_credential_patch_or_create**](UserCredentialApi.md#user_credential_patch_or_create) | **PATCH** /UserCredentials | Patch an existing model instance or insert a new one into the data source.
[**user_credential_prototype_get_user**](UserCredentialApi.md#user_credential_prototype_get_user) | **GET** /UserCredentials/{id}/user | Fetches belongsTo relation user.
[**user_credential_prototype_patch_attributes**](UserCredentialApi.md#user_credential_prototype_patch_attributes) | **PATCH** /UserCredentials/{id} | Patch attributes for a model instance and persist it into the data source.
[**user_credential_replace_by_id_post_user_credentialsid_replace**](UserCredentialApi.md#user_credential_replace_by_id_post_user_credentialsid_replace) | **POST** /UserCredentials/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**user_credential_replace_by_id_put_user_credentialsid**](UserCredentialApi.md#user_credential_replace_by_id_put_user_credentialsid) | **PUT** /UserCredentials/{id} | Replace attributes for a model instance and persist it into the data source.
[**user_credential_replace_or_create_post_user_credentials_replace_or_create**](UserCredentialApi.md#user_credential_replace_or_create_post_user_credentials_replace_or_create) | **POST** /UserCredentials/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**user_credential_replace_or_create_put_user_credentials**](UserCredentialApi.md#user_credential_replace_or_create_put_user_credentials) | **PUT** /UserCredentials | Replace an existing model instance or insert a new one into the data source.
[**user_credential_update_all**](UserCredentialApi.md#user_credential_update_all) | **POST** /UserCredentials/update | Update instances of the model matched by {{where}} from the data source.
[**user_credential_upsert_with_where**](UserCredentialApi.md#user_credential_upsert_with_where) | **POST** /UserCredentials/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **user_credential_count**
> InlineResponse200 user_credential_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.user_credential_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_count: %s\n" % e)
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

# **user_credential_create**
> UserCredential user_credential_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
data = swagger_client.UserCredential() # UserCredential | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.user_credential_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserCredential**](UserCredential.md)| Model instance data | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_create_change_stream_get_user_credentials_change_stream**
> file user_credential_create_change_stream_get_user_credentials_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.user_credential_create_change_stream_get_user_credentials_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_create_change_stream_get_user_credentials_change_stream: %s\n" % e)
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

# **user_credential_create_change_stream_post_user_credentials_change_stream**
> file user_credential_create_change_stream_post_user_credentials_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.user_credential_create_change_stream_post_user_credentials_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_create_change_stream_post_user_credentials_change_stream: %s\n" % e)
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

# **user_credential_delete_by_id**
> object user_credential_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.user_credential_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_delete_by_id: %s\n" % e)
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

# **user_credential_exists_get_user_credentialsid_exists**
> InlineResponse2001 user_credential_exists_get_user_credentialsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.user_credential_exists_get_user_credentialsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_exists_get_user_credentialsid_exists: %s\n" % e)
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

# **user_credential_exists_head_user_credentialsid**
> InlineResponse2001 user_credential_exists_head_user_credentialsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.user_credential_exists_head_user_credentialsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_exists_head_user_credentialsid: %s\n" % e)
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

# **user_credential_find**
> list[UserCredential] user_credential_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.user_credential_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[UserCredential]**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_find_by_id**
> UserCredential user_credential_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.user_credential_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_find_one**
> UserCredential user_credential_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.user_credential_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_patch_or_create**
> UserCredential user_credential_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
data = swagger_client.UserCredential() # UserCredential | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_credential_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserCredential**](UserCredential.md)| Model instance data | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_prototype_get_user**
> User user_credential_prototype_get_user(id, refresh=refresh)

Fetches belongsTo relation user.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | UserCredential id
refresh = true # bool |  (optional)

try: 
    # Fetches belongsTo relation user.
    api_response = api_instance.user_credential_prototype_get_user(id, refresh=refresh)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_prototype_get_user: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| UserCredential id | 
 **refresh** | **bool**|  | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_prototype_patch_attributes**
> UserCredential user_credential_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | UserCredential id
data = swagger_client.UserCredential() # UserCredential | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_credential_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| UserCredential id | 
 **data** | [**UserCredential**](UserCredential.md)| An object of model property name/value pairs | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_replace_by_id_post_user_credentialsid_replace**
> UserCredential user_credential_replace_by_id_post_user_credentialsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | Model id
data = swagger_client.UserCredential() # UserCredential | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_credential_replace_by_id_post_user_credentialsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_replace_by_id_post_user_credentialsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**UserCredential**](UserCredential.md)| Model instance data | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_replace_by_id_put_user_credentialsid**
> UserCredential user_credential_replace_by_id_put_user_credentialsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
id = 'id_example' # str | Model id
data = swagger_client.UserCredential() # UserCredential | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_credential_replace_by_id_put_user_credentialsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_replace_by_id_put_user_credentialsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**UserCredential**](UserCredential.md)| Model instance data | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_replace_or_create_post_user_credentials_replace_or_create**
> UserCredential user_credential_replace_or_create_post_user_credentials_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
data = swagger_client.UserCredential() # UserCredential | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_credential_replace_or_create_post_user_credentials_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_replace_or_create_post_user_credentials_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserCredential**](UserCredential.md)| Model instance data | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_replace_or_create_put_user_credentials**
> UserCredential user_credential_replace_or_create_put_user_credentials(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
data = swagger_client.UserCredential() # UserCredential | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_credential_replace_or_create_put_user_credentials(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_replace_or_create_put_user_credentials: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**UserCredential**](UserCredential.md)| Model instance data | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_update_all**
> InlineResponse2002 user_credential_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.UserCredential() # UserCredential | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.user_credential_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**UserCredential**](UserCredential.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_credential_upsert_with_where**
> UserCredential user_credential_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserCredentialApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.UserCredential() # UserCredential | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.user_credential_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserCredentialApi->user_credential_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**UserCredential**](UserCredential.md)| An object of model property name/value pairs | [optional] 

### Return type

[**UserCredential**](UserCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

