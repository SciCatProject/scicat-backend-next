# swagger_client.UserApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**user_change_password**](UserApi.md#user_change_password) | **POST** /Users/change-password | Change a user&#39;s password.
[**user_confirm**](UserApi.md#user_confirm) | **GET** /Users/confirm | Confirm a user registration with identity verification token.
[**user_count**](UserApi.md#user_count) | **GET** /Users/count | Count instances of the model matched by where from the data source.
[**user_create**](UserApi.md#user_create) | **POST** /Users | Create a new instance of the model and persist it into the data source.
[**user_create_change_stream_get_users_change_stream**](UserApi.md#user_create_change_stream_get_users_change_stream) | **GET** /Users/change-stream | Create a change stream.
[**user_create_change_stream_post_users_change_stream**](UserApi.md#user_create_change_stream_post_users_change_stream) | **POST** /Users/change-stream | Create a change stream.
[**user_delete_by_id**](UserApi.md#user_delete_by_id) | **DELETE** /Users/{id} | Delete a model instance by {{id}} from the data source.
[**user_exists_get_usersid_exists**](UserApi.md#user_exists_get_usersid_exists) | **GET** /Users/{id}/exists | Check whether a model instance exists in the data source.
[**user_exists_head_usersid**](UserApi.md#user_exists_head_usersid) | **HEAD** /Users/{id} | Check whether a model instance exists in the data source.
[**user_find**](UserApi.md#user_find) | **GET** /Users | Find all instances of the model matched by filter from the data source.
[**user_find_by_id**](UserApi.md#user_find_by_id) | **GET** /Users/{id} | Find a model instance by {{id}} from the data source.
[**user_find_one**](UserApi.md#user_find_one) | **GET** /Users/findOne | Find first instance of the model matched by filter from the data source.
[**user_login**](UserApi.md#user_login) | **POST** /Users/login | Login a user with username/email and password.
[**user_logout**](UserApi.md#user_logout) | **POST** /Users/logout | Logout a user with access token.
[**user_patch_or_create**](UserApi.md#user_patch_or_create) | **PATCH** /Users | Patch an existing model instance or insert a new one into the data source.
[**user_prototype_count_access_tokens**](UserApi.md#user_prototype_count_access_tokens) | **GET** /Users/{id}/accessTokens/count | Counts accessTokens of User.
[**user_prototype_create_access_tokens**](UserApi.md#user_prototype_create_access_tokens) | **POST** /Users/{id}/accessTokens | Creates a new instance in accessTokens of this model.
[**user_prototype_delete_access_tokens**](UserApi.md#user_prototype_delete_access_tokens) | **DELETE** /Users/{id}/accessTokens | Deletes all accessTokens of this model.
[**user_prototype_destroy_by_id_access_tokens**](UserApi.md#user_prototype_destroy_by_id_access_tokens) | **DELETE** /Users/{id}/accessTokens/{fk} | Delete a related item by id for accessTokens.
[**user_prototype_find_by_id_access_tokens**](UserApi.md#user_prototype_find_by_id_access_tokens) | **GET** /Users/{id}/accessTokens/{fk} | Find a related item by id for accessTokens.
[**user_prototype_get_access_tokens**](UserApi.md#user_prototype_get_access_tokens) | **GET** /Users/{id}/accessTokens | Queries accessTokens of User.
[**user_prototype_patch_attributes**](UserApi.md#user_prototype_patch_attributes) | **PATCH** /Users/{id} | Patch attributes for a model instance and persist it into the data source.
[**user_prototype_update_by_id_access_tokens**](UserApi.md#user_prototype_update_by_id_access_tokens) | **PUT** /Users/{id}/accessTokens/{fk} | Update a related item by id for accessTokens.
[**user_prototype_verify**](UserApi.md#user_prototype_verify) | **POST** /Users/{id}/verify | Trigger user&#39;s identity verification with configured verifyOptions
[**user_replace_by_id_post_usersid_replace**](UserApi.md#user_replace_by_id_post_usersid_replace) | **POST** /Users/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**user_replace_by_id_put_usersid**](UserApi.md#user_replace_by_id_put_usersid) | **PUT** /Users/{id} | Replace attributes for a model instance and persist it into the data source.
[**user_replace_or_create_post_users_replace_or_create**](UserApi.md#user_replace_or_create_post_users_replace_or_create) | **POST** /Users/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**user_replace_or_create_put_users**](UserApi.md#user_replace_or_create_put_users) | **PUT** /Users | Replace an existing model instance or insert a new one into the data source.
[**user_reset_password**](UserApi.md#user_reset_password) | **POST** /Users/reset | Reset password for a user with email.
[**user_set_password**](UserApi.md#user_set_password) | **POST** /Users/reset-password | Reset user&#39;s password via a password-reset token.
[**user_update_all**](UserApi.md#user_update_all) | **POST** /Users/update | Update instances of the model matched by {{where}} from the data source.
[**user_upsert_with_where**](UserApi.md#user_upsert_with_where) | **POST** /Users/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **user_change_password**
> user_change_password(oldPassword, newPassword)

Change a user's password.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
oldPassword = 'oldPassword_example' # str | 
newPassword = 'newPassword_example' # str | 

try: 
    # Change a user's password.
    api_instance.user_change_password(oldPassword, newPassword)
except ApiException as e:
    print("Exception when calling UserApi->user_change_password: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **oldPassword** | **str**|  | 
 **newPassword** | **str**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_confirm**
> user_confirm(uid, token, redirect=redirect)

Confirm a user registration with identity verification token.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
uid = 'uid_example' # str | 
token = 'token_example' # str | 
redirect = 'redirect_example' # str |  (optional)

try: 
    # Confirm a user registration with identity verification token.
    api_instance.user_confirm(uid, token, redirect=redirect)
except ApiException as e:
    print("Exception when calling UserApi->user_confirm: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **uid** | **str**|  | 
 **token** | **str**|  | 
 **redirect** | **str**|  | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_count**
> InlineResponse200 user_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.user_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_count: %s\n" % e)
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

# **user_create**
> User user_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
data = swagger_client.User() # User | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.user_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**User**](User.md)| Model instance data | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_create_change_stream_get_users_change_stream**
> file user_create_change_stream_get_users_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.user_create_change_stream_get_users_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_create_change_stream_get_users_change_stream: %s\n" % e)
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

# **user_create_change_stream_post_users_change_stream**
> file user_create_change_stream_post_users_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.user_create_change_stream_post_users_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_create_change_stream_post_users_change_stream: %s\n" % e)
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

# **user_delete_by_id**
> object user_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.user_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_delete_by_id: %s\n" % e)
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

# **user_exists_get_usersid_exists**
> InlineResponse2001 user_exists_get_usersid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.user_exists_get_usersid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_exists_get_usersid_exists: %s\n" % e)
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

# **user_exists_head_usersid**
> InlineResponse2001 user_exists_head_usersid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.user_exists_head_usersid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_exists_head_usersid: %s\n" % e)
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

# **user_find**
> list[User] user_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.user_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[User]**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_find_by_id**
> User user_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.user_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_find_one**
> User user_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.user_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_login**
> object user_login(credentials, include=include)

Login a user with username/email and password.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
credentials = NULL # object | 
include = 'include_example' # str | Related objects to include in the response. See the description of return value for more details. (optional)

try: 
    # Login a user with username/email and password.
    api_response = api_instance.user_login(credentials, include=include)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_login: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **credentials** | **object**|  | 
 **include** | **str**| Related objects to include in the response. See the description of return value for more details. | [optional] 

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_logout**
> user_logout()

Logout a user with access token.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()

try: 
    # Logout a user with access token.
    api_instance.user_logout()
except ApiException as e:
    print("Exception when calling UserApi->user_logout: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_patch_or_create**
> User user_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
data = swagger_client.User() # User | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**User**](User.md)| Model instance data | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_count_access_tokens**
> InlineResponse200 user_prototype_count_access_tokens(id, where=where)

Counts accessTokens of User.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts accessTokens of User.
    api_response = api_instance.user_prototype_count_access_tokens(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_count_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_create_access_tokens**
> AccessToken user_prototype_create_access_tokens(id, data=data)

Creates a new instance in accessTokens of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
data = swagger_client.AccessToken() # AccessToken |  (optional)

try: 
    # Creates a new instance in accessTokens of this model.
    api_response = api_instance.user_prototype_create_access_tokens(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_create_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **data** | [**AccessToken**](AccessToken.md)|  | [optional] 

### Return type

[**AccessToken**](AccessToken.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_delete_access_tokens**
> user_prototype_delete_access_tokens(id)

Deletes all accessTokens of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id

try: 
    # Deletes all accessTokens of this model.
    api_instance.user_prototype_delete_access_tokens(id)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_delete_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_destroy_by_id_access_tokens**
> user_prototype_destroy_by_id_access_tokens(id, fk)

Delete a related item by id for accessTokens.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
fk = 'fk_example' # str | Foreign key for accessTokens

try: 
    # Delete a related item by id for accessTokens.
    api_instance.user_prototype_destroy_by_id_access_tokens(id, fk)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_destroy_by_id_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **fk** | **str**| Foreign key for accessTokens | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_find_by_id_access_tokens**
> AccessToken user_prototype_find_by_id_access_tokens(id, fk)

Find a related item by id for accessTokens.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
fk = 'fk_example' # str | Foreign key for accessTokens

try: 
    # Find a related item by id for accessTokens.
    api_response = api_instance.user_prototype_find_by_id_access_tokens(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_find_by_id_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **fk** | **str**| Foreign key for accessTokens | 

### Return type

[**AccessToken**](AccessToken.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_get_access_tokens**
> list[AccessToken] user_prototype_get_access_tokens(id, filter=filter)

Queries accessTokens of User.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries accessTokens of User.
    api_response = api_instance.user_prototype_get_access_tokens(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_get_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[AccessToken]**](AccessToken.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_patch_attributes**
> User user_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
data = swagger_client.User() # User | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **data** | [**User**](User.md)| An object of model property name/value pairs | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_update_by_id_access_tokens**
> AccessToken user_prototype_update_by_id_access_tokens(id, fk, data=data)

Update a related item by id for accessTokens.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id
fk = 'fk_example' # str | Foreign key for accessTokens
data = swagger_client.AccessToken() # AccessToken |  (optional)

try: 
    # Update a related item by id for accessTokens.
    api_response = api_instance.user_prototype_update_by_id_access_tokens(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_update_by_id_access_tokens: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 
 **fk** | **str**| Foreign key for accessTokens | 
 **data** | [**AccessToken**](AccessToken.md)|  | [optional] 

### Return type

[**AccessToken**](AccessToken.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_prototype_verify**
> user_prototype_verify(id)

Trigger user's identity verification with configured verifyOptions

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | User id

try: 
    # Trigger user's identity verification with configured verifyOptions
    api_instance.user_prototype_verify(id)
except ApiException as e:
    print("Exception when calling UserApi->user_prototype_verify: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| User id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_replace_by_id_post_usersid_replace**
> User user_replace_by_id_post_usersid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | Model id
data = swagger_client.User() # User | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_replace_by_id_post_usersid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_replace_by_id_post_usersid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**User**](User.md)| Model instance data | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_replace_by_id_put_usersid**
> User user_replace_by_id_put_usersid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
id = 'id_example' # str | Model id
data = swagger_client.User() # User | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.user_replace_by_id_put_usersid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_replace_by_id_put_usersid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**User**](User.md)| Model instance data | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_replace_or_create_post_users_replace_or_create**
> User user_replace_or_create_post_users_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
data = swagger_client.User() # User | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_replace_or_create_post_users_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_replace_or_create_post_users_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**User**](User.md)| Model instance data | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_replace_or_create_put_users**
> User user_replace_or_create_put_users(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
data = swagger_client.User() # User | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.user_replace_or_create_put_users(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_replace_or_create_put_users: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**User**](User.md)| Model instance data | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_reset_password**
> user_reset_password(options)

Reset password for a user with email.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
options = NULL # object | 

try: 
    # Reset password for a user with email.
    api_instance.user_reset_password(options)
except ApiException as e:
    print("Exception when calling UserApi->user_reset_password: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **options** | **object**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_set_password**
> user_set_password(newPassword)

Reset user's password via a password-reset token.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
newPassword = 'newPassword_example' # str | 

try: 
    # Reset user's password via a password-reset token.
    api_instance.user_set_password(newPassword)
except ApiException as e:
    print("Exception when calling UserApi->user_set_password: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **newPassword** | **str**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_update_all**
> InlineResponse2002 user_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.User() # User | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.user_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**User**](User.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_upsert_with_where**
> User user_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.User() # User | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.user_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserApi->user_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**User**](User.md)| An object of model property name/value pairs | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

