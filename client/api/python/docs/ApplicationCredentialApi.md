# swagger_client.ApplicationCredentialApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**application_credential_count**](ApplicationCredentialApi.md#application_credential_count) | **GET** /ApplicationCredentials/count | Count instances of the model matched by where from the data source.
[**application_credential_create**](ApplicationCredentialApi.md#application_credential_create) | **POST** /ApplicationCredentials | Create a new instance of the model and persist it into the data source.
[**application_credential_create_change_stream_get_application_credentials_change_stream**](ApplicationCredentialApi.md#application_credential_create_change_stream_get_application_credentials_change_stream) | **GET** /ApplicationCredentials/change-stream | Create a change stream.
[**application_credential_create_change_stream_post_application_credentials_change_stream**](ApplicationCredentialApi.md#application_credential_create_change_stream_post_application_credentials_change_stream) | **POST** /ApplicationCredentials/change-stream | Create a change stream.
[**application_credential_delete_by_id**](ApplicationCredentialApi.md#application_credential_delete_by_id) | **DELETE** /ApplicationCredentials/{id} | Delete a model instance by {{id}} from the data source.
[**application_credential_exists_get_application_credentialsid_exists**](ApplicationCredentialApi.md#application_credential_exists_get_application_credentialsid_exists) | **GET** /ApplicationCredentials/{id}/exists | Check whether a model instance exists in the data source.
[**application_credential_exists_head_application_credentialsid**](ApplicationCredentialApi.md#application_credential_exists_head_application_credentialsid) | **HEAD** /ApplicationCredentials/{id} | Check whether a model instance exists in the data source.
[**application_credential_find**](ApplicationCredentialApi.md#application_credential_find) | **GET** /ApplicationCredentials | Find all instances of the model matched by filter from the data source.
[**application_credential_find_by_id**](ApplicationCredentialApi.md#application_credential_find_by_id) | **GET** /ApplicationCredentials/{id} | Find a model instance by {{id}} from the data source.
[**application_credential_find_one**](ApplicationCredentialApi.md#application_credential_find_one) | **GET** /ApplicationCredentials/findOne | Find first instance of the model matched by filter from the data source.
[**application_credential_patch_or_create**](ApplicationCredentialApi.md#application_credential_patch_or_create) | **PATCH** /ApplicationCredentials | Patch an existing model instance or insert a new one into the data source.
[**application_credential_prototype_patch_attributes**](ApplicationCredentialApi.md#application_credential_prototype_patch_attributes) | **PATCH** /ApplicationCredentials/{id} | Patch attributes for a model instance and persist it into the data source.
[**application_credential_replace_by_id_post_application_credentialsid_replace**](ApplicationCredentialApi.md#application_credential_replace_by_id_post_application_credentialsid_replace) | **POST** /ApplicationCredentials/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**application_credential_replace_by_id_put_application_credentialsid**](ApplicationCredentialApi.md#application_credential_replace_by_id_put_application_credentialsid) | **PUT** /ApplicationCredentials/{id} | Replace attributes for a model instance and persist it into the data source.
[**application_credential_replace_or_create_post_application_credentials_replace_or_create**](ApplicationCredentialApi.md#application_credential_replace_or_create_post_application_credentials_replace_or_create) | **POST** /ApplicationCredentials/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**application_credential_replace_or_create_put_application_credentials**](ApplicationCredentialApi.md#application_credential_replace_or_create_put_application_credentials) | **PUT** /ApplicationCredentials | Replace an existing model instance or insert a new one into the data source.
[**application_credential_update_all**](ApplicationCredentialApi.md#application_credential_update_all) | **POST** /ApplicationCredentials/update | Update instances of the model matched by {{where}} from the data source.
[**application_credential_upsert_with_where**](ApplicationCredentialApi.md#application_credential_upsert_with_where) | **POST** /ApplicationCredentials/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **application_credential_count**
> InlineResponse200 application_credential_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.application_credential_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_count: %s\n" % e)
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

# **application_credential_create**
> ApplicationCredential application_credential_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
data = swagger_client.ApplicationCredential() # ApplicationCredential | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.application_credential_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| Model instance data | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_create_change_stream_get_application_credentials_change_stream**
> file application_credential_create_change_stream_get_application_credentials_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.application_credential_create_change_stream_get_application_credentials_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_create_change_stream_get_application_credentials_change_stream: %s\n" % e)
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

# **application_credential_create_change_stream_post_application_credentials_change_stream**
> file application_credential_create_change_stream_post_application_credentials_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.application_credential_create_change_stream_post_application_credentials_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_create_change_stream_post_application_credentials_change_stream: %s\n" % e)
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

# **application_credential_delete_by_id**
> object application_credential_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.application_credential_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_delete_by_id: %s\n" % e)
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

# **application_credential_exists_get_application_credentialsid_exists**
> InlineResponse2001 application_credential_exists_get_application_credentialsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.application_credential_exists_get_application_credentialsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_exists_get_application_credentialsid_exists: %s\n" % e)
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

# **application_credential_exists_head_application_credentialsid**
> InlineResponse2001 application_credential_exists_head_application_credentialsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.application_credential_exists_head_application_credentialsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_exists_head_application_credentialsid: %s\n" % e)
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

# **application_credential_find**
> list[ApplicationCredential] application_credential_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.application_credential_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[ApplicationCredential]**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_find_by_id**
> ApplicationCredential application_credential_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.application_credential_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_find_one**
> ApplicationCredential application_credential_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.application_credential_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_patch_or_create**
> ApplicationCredential application_credential_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
data = swagger_client.ApplicationCredential() # ApplicationCredential | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.application_credential_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| Model instance data | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_prototype_patch_attributes**
> ApplicationCredential application_credential_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | ApplicationCredential id
data = swagger_client.ApplicationCredential() # ApplicationCredential | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.application_credential_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| ApplicationCredential id | 
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| An object of model property name/value pairs | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_replace_by_id_post_application_credentialsid_replace**
> ApplicationCredential application_credential_replace_by_id_post_application_credentialsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | Model id
data = swagger_client.ApplicationCredential() # ApplicationCredential | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.application_credential_replace_by_id_post_application_credentialsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_replace_by_id_post_application_credentialsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| Model instance data | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_replace_by_id_put_application_credentialsid**
> ApplicationCredential application_credential_replace_by_id_put_application_credentialsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
id = 'id_example' # str | Model id
data = swagger_client.ApplicationCredential() # ApplicationCredential | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.application_credential_replace_by_id_put_application_credentialsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_replace_by_id_put_application_credentialsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| Model instance data | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_replace_or_create_post_application_credentials_replace_or_create**
> ApplicationCredential application_credential_replace_or_create_post_application_credentials_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
data = swagger_client.ApplicationCredential() # ApplicationCredential | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.application_credential_replace_or_create_post_application_credentials_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_replace_or_create_post_application_credentials_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| Model instance data | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_replace_or_create_put_application_credentials**
> ApplicationCredential application_credential_replace_or_create_put_application_credentials(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
data = swagger_client.ApplicationCredential() # ApplicationCredential | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.application_credential_replace_or_create_put_application_credentials(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_replace_or_create_put_application_credentials: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| Model instance data | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_update_all**
> InlineResponse2002 application_credential_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.ApplicationCredential() # ApplicationCredential | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.application_credential_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **application_credential_upsert_with_where**
> ApplicationCredential application_credential_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationCredentialApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.ApplicationCredential() # ApplicationCredential | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.application_credential_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationCredentialApi->application_credential_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**ApplicationCredential**](ApplicationCredential.md)| An object of model property name/value pairs | [optional] 

### Return type

[**ApplicationCredential**](ApplicationCredential.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

