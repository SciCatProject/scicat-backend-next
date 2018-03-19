# swagger_client.ProposalApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**proposal_count**](ProposalApi.md#proposal_count) | **GET** /Proposals/count | Count instances of the model matched by where from the data source.
[**proposal_create**](ProposalApi.md#proposal_create) | **POST** /Proposals | Create a new instance of the model and persist it into the data source.
[**proposal_create_change_stream_get_proposals_change_stream**](ProposalApi.md#proposal_create_change_stream_get_proposals_change_stream) | **GET** /Proposals/change-stream | Create a change stream.
[**proposal_create_change_stream_post_proposals_change_stream**](ProposalApi.md#proposal_create_change_stream_post_proposals_change_stream) | **POST** /Proposals/change-stream | Create a change stream.
[**proposal_delete_by_id**](ProposalApi.md#proposal_delete_by_id) | **DELETE** /Proposals/{id} | Delete a model instance by {{id}} from the data source.
[**proposal_exists_get_proposalsid_exists**](ProposalApi.md#proposal_exists_get_proposalsid_exists) | **GET** /Proposals/{id}/exists | Check whether a model instance exists in the data source.
[**proposal_exists_head_proposalsid**](ProposalApi.md#proposal_exists_head_proposalsid) | **HEAD** /Proposals/{id} | Check whether a model instance exists in the data source.
[**proposal_find**](ProposalApi.md#proposal_find) | **GET** /Proposals | Find all instances of the model matched by filter from the data source.
[**proposal_find_by_id**](ProposalApi.md#proposal_find_by_id) | **GET** /Proposals/{id} | Find a model instance by {{id}} from the data source.
[**proposal_find_by_instrument_and_date**](ProposalApi.md#proposal_find_by_instrument_and_date) | **GET** /Proposals/findByInstrumentAndDate | Find proposal that took data at specified instrument and time
[**proposal_find_one**](ProposalApi.md#proposal_find_one) | **GET** /Proposals/findOne | Find first instance of the model matched by filter from the data source.
[**proposal_is_valid**](ProposalApi.md#proposal_is_valid) | **POST** /Proposals/isValid | Check if data is valid according to a schema
[**proposal_patch_or_create**](ProposalApi.md#proposal_patch_or_create) | **PATCH** /Proposals | Patch an existing model instance or insert a new one into the data source.
[**proposal_prototype_count_measurement_periods**](ProposalApi.md#proposal_prototype_count_measurement_periods) | **GET** /Proposals/{id}/measurementPeriods/count | Counts measurementPeriods of Proposal.
[**proposal_prototype_create_measurement_periods**](ProposalApi.md#proposal_prototype_create_measurement_periods) | **POST** /Proposals/{id}/measurementPeriods | Creates a new instance in measurementPeriods of this model.
[**proposal_prototype_delete_measurement_periods**](ProposalApi.md#proposal_prototype_delete_measurement_periods) | **DELETE** /Proposals/{id}/measurementPeriods | Deletes all measurementPeriods of this model.
[**proposal_prototype_destroy_by_id_measurement_periods**](ProposalApi.md#proposal_prototype_destroy_by_id_measurement_periods) | **DELETE** /Proposals/{id}/measurementPeriods/{fk} | Delete a related item by id for measurementPeriods.
[**proposal_prototype_find_by_id_measurement_periods**](ProposalApi.md#proposal_prototype_find_by_id_measurement_periods) | **GET** /Proposals/{id}/measurementPeriods/{fk} | Find a related item by id for measurementPeriods.
[**proposal_prototype_get_measurement_periods**](ProposalApi.md#proposal_prototype_get_measurement_periods) | **GET** /Proposals/{id}/measurementPeriods | Queries measurementPeriods of Proposal.
[**proposal_prototype_patch_attributes**](ProposalApi.md#proposal_prototype_patch_attributes) | **PATCH** /Proposals/{id} | Patch attributes for a model instance and persist it into the data source.
[**proposal_prototype_update_by_id_measurement_periods**](ProposalApi.md#proposal_prototype_update_by_id_measurement_periods) | **PUT** /Proposals/{id}/measurementPeriods/{fk} | Update a related item by id for measurementPeriods.
[**proposal_replace_by_id_post_proposalsid_replace**](ProposalApi.md#proposal_replace_by_id_post_proposalsid_replace) | **POST** /Proposals/{id}/replace | Replace attributes for a model instance and persist it into the data source.
[**proposal_replace_by_id_put_proposalsid**](ProposalApi.md#proposal_replace_by_id_put_proposalsid) | **PUT** /Proposals/{id} | Replace attributes for a model instance and persist it into the data source.
[**proposal_replace_or_create_post_proposals_replace_or_create**](ProposalApi.md#proposal_replace_or_create_post_proposals_replace_or_create) | **POST** /Proposals/replaceOrCreate | Replace an existing model instance or insert a new one into the data source.
[**proposal_replace_or_create_put_proposals**](ProposalApi.md#proposal_replace_or_create_put_proposals) | **PUT** /Proposals | Replace an existing model instance or insert a new one into the data source.
[**proposal_search_text**](ProposalApi.md#proposal_search_text) | **GET** /Proposals/searchText | Search text inside proposal
[**proposal_update_all**](ProposalApi.md#proposal_update_all) | **POST** /Proposals/update | Update instances of the model matched by {{where}} from the data source.
[**proposal_upsert_with_where**](ProposalApi.md#proposal_upsert_with_where) | **POST** /Proposals/upsertWithWhere | Update an existing model instance or insert a new one into the data source based on the where criteria.


# **proposal_count**
> InlineResponse200 proposal_count(where=where)

Count instances of the model matched by where from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Count instances of the model matched by where from the data source.
    api_response = api_instance.proposal_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_count: %s\n" % e)
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

# **proposal_create**
> Proposal proposal_create(data=data)

Create a new instance of the model and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
data = swagger_client.Proposal() # Proposal | Model instance data (optional)

try: 
    # Create a new instance of the model and persist it into the data source.
    api_response = api_instance.proposal_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Proposal**](Proposal.md)| Model instance data | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_create_change_stream_get_proposals_change_stream**
> file proposal_create_change_stream_get_proposals_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.proposal_create_change_stream_get_proposals_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_create_change_stream_get_proposals_change_stream: %s\n" % e)
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

# **proposal_create_change_stream_post_proposals_change_stream**
> file proposal_create_change_stream_post_proposals_change_stream(options=options)

Create a change stream.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
options = 'options_example' # str |  (optional)

try: 
    # Create a change stream.
    api_response = api_instance.proposal_create_change_stream_post_proposals_change_stream(options=options)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_create_change_stream_post_proposals_change_stream: %s\n" % e)
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

# **proposal_delete_by_id**
> object proposal_delete_by_id(id)

Delete a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Model id

try: 
    # Delete a model instance by {{id}} from the data source.
    api_response = api_instance.proposal_delete_by_id(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_delete_by_id: %s\n" % e)
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

# **proposal_exists_get_proposalsid_exists**
> InlineResponse2001 proposal_exists_get_proposalsid_exists(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.proposal_exists_get_proposalsid_exists(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_exists_get_proposalsid_exists: %s\n" % e)
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

# **proposal_exists_head_proposalsid**
> InlineResponse2001 proposal_exists_head_proposalsid(id)

Check whether a model instance exists in the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Model id

try: 
    # Check whether a model instance exists in the data source.
    api_response = api_instance.proposal_exists_head_proposalsid(id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_exists_head_proposalsid: %s\n" % e)
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

# **proposal_find**
> list[Proposal] proposal_find(filter=filter)

Find all instances of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find all instances of the model matched by filter from the data source.
    api_response = api_instance.proposal_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**list[Proposal]**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_find_by_id**
> Proposal proposal_find_by_id(id, filter=filter)

Find a model instance by {{id}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Model id
filter = 'filter_example' # str | Filter defining fields and include - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find a model instance by {{id}} from the data source.
    api_response = api_instance.proposal_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **filter** | **str**| Filter defining fields and include - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_find_by_instrument_and_date**
> InlineResponse2005 proposal_find_by_instrument_and_date(instrument=instrument, measureTime=measureTime)

Find proposal that took data at specified instrument and time

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
instrument = 'instrument_example' # str |  (optional)
measureTime = '2013-10-20T19:20:30+01:00' # datetime |  (optional)

try: 
    # Find proposal that took data at specified instrument and time
    api_response = api_instance.proposal_find_by_instrument_and_date(instrument=instrument, measureTime=measureTime)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_find_by_instrument_and_date: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **instrument** | **str**|  | [optional] 
 **measureTime** | **datetime**|  | [optional] 

### Return type

[**InlineResponse2005**](InlineResponse2005.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_find_one**
> Proposal proposal_find_one(filter=filter)

Find first instance of the model matched by filter from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
filter = 'filter_example' # str | Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\"something\":\"value\"}) (optional)

try: 
    # Find first instance of the model matched by filter from the data source.
    api_response = api_instance.proposal_find_one(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_find_one: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | **str**| Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({\&quot;something\&quot;:\&quot;value\&quot;}) | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_is_valid**
> XAny proposal_is_valid(ownableItem=ownableItem)

Check if data is valid according to a schema

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
ownableItem = NULL # object |  (optional)

try: 
    # Check if data is valid according to a schema
    api_response = api_instance.proposal_is_valid(ownableItem=ownableItem)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_is_valid: %s\n" % e)
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

# **proposal_patch_or_create**
> Proposal proposal_patch_or_create(data=data)

Patch an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
data = swagger_client.Proposal() # Proposal | Model instance data (optional)

try: 
    # Patch an existing model instance or insert a new one into the data source.
    api_response = api_instance.proposal_patch_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_patch_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Proposal**](Proposal.md)| Model instance data | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_count_measurement_periods**
> InlineResponse200 proposal_prototype_count_measurement_periods(id, where=where)

Counts measurementPeriods of Proposal.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
where = 'where_example' # str | Criteria to match model instances (optional)

try: 
    # Counts measurementPeriods of Proposal.
    api_response = api_instance.proposal_prototype_count_measurement_periods(id, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_count_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **where** | **str**| Criteria to match model instances | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_create_measurement_periods**
> MeasurementPeriod proposal_prototype_create_measurement_periods(id, data=data)

Creates a new instance in measurementPeriods of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
data = swagger_client.MeasurementPeriod() # MeasurementPeriod |  (optional)

try: 
    # Creates a new instance in measurementPeriods of this model.
    api_response = api_instance.proposal_prototype_create_measurement_periods(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_create_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **data** | [**MeasurementPeriod**](MeasurementPeriod.md)|  | [optional] 

### Return type

[**MeasurementPeriod**](MeasurementPeriod.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_delete_measurement_periods**
> proposal_prototype_delete_measurement_periods(id)

Deletes all measurementPeriods of this model.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id

try: 
    # Deletes all measurementPeriods of this model.
    api_instance.proposal_prototype_delete_measurement_periods(id)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_delete_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_destroy_by_id_measurement_periods**
> proposal_prototype_destroy_by_id_measurement_periods(id, fk)

Delete a related item by id for measurementPeriods.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
fk = 'fk_example' # str | Foreign key for measurementPeriods

try: 
    # Delete a related item by id for measurementPeriods.
    api_instance.proposal_prototype_destroy_by_id_measurement_periods(id, fk)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_destroy_by_id_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **fk** | **str**| Foreign key for measurementPeriods | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_find_by_id_measurement_periods**
> MeasurementPeriod proposal_prototype_find_by_id_measurement_periods(id, fk)

Find a related item by id for measurementPeriods.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
fk = 'fk_example' # str | Foreign key for measurementPeriods

try: 
    # Find a related item by id for measurementPeriods.
    api_response = api_instance.proposal_prototype_find_by_id_measurement_periods(id, fk)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_find_by_id_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **fk** | **str**| Foreign key for measurementPeriods | 

### Return type

[**MeasurementPeriod**](MeasurementPeriod.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_get_measurement_periods**
> list[MeasurementPeriod] proposal_prototype_get_measurement_periods(id, filter=filter)

Queries measurementPeriods of Proposal.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
filter = 'filter_example' # str |  (optional)

try: 
    # Queries measurementPeriods of Proposal.
    api_response = api_instance.proposal_prototype_get_measurement_periods(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_get_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **filter** | **str**|  | [optional] 

### Return type

[**list[MeasurementPeriod]**](MeasurementPeriod.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_patch_attributes**
> Proposal proposal_prototype_patch_attributes(id, data=data)

Patch attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
data = swagger_client.Proposal() # Proposal | An object of model property name/value pairs (optional)

try: 
    # Patch attributes for a model instance and persist it into the data source.
    api_response = api_instance.proposal_prototype_patch_attributes(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_patch_attributes: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **data** | [**Proposal**](Proposal.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_prototype_update_by_id_measurement_periods**
> MeasurementPeriod proposal_prototype_update_by_id_measurement_periods(id, fk, data=data)

Update a related item by id for measurementPeriods.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Proposal id
fk = 'fk_example' # str | Foreign key for measurementPeriods
data = swagger_client.MeasurementPeriod() # MeasurementPeriod |  (optional)

try: 
    # Update a related item by id for measurementPeriods.
    api_response = api_instance.proposal_prototype_update_by_id_measurement_periods(id, fk, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_prototype_update_by_id_measurement_periods: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Proposal id | 
 **fk** | **str**| Foreign key for measurementPeriods | 
 **data** | [**MeasurementPeriod**](MeasurementPeriod.md)|  | [optional] 

### Return type

[**MeasurementPeriod**](MeasurementPeriod.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_replace_by_id_post_proposalsid_replace**
> Proposal proposal_replace_by_id_post_proposalsid_replace(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Model id
data = swagger_client.Proposal() # Proposal | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.proposal_replace_by_id_post_proposalsid_replace(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_replace_by_id_post_proposalsid_replace: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Proposal**](Proposal.md)| Model instance data | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_replace_by_id_put_proposalsid**
> Proposal proposal_replace_by_id_put_proposalsid(id, data=data)

Replace attributes for a model instance and persist it into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
id = 'id_example' # str | Model id
data = swagger_client.Proposal() # Proposal | Model instance data (optional)

try: 
    # Replace attributes for a model instance and persist it into the data source.
    api_response = api_instance.proposal_replace_by_id_put_proposalsid(id, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_replace_by_id_put_proposalsid: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**| Model id | 
 **data** | [**Proposal**](Proposal.md)| Model instance data | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_replace_or_create_post_proposals_replace_or_create**
> Proposal proposal_replace_or_create_post_proposals_replace_or_create(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
data = swagger_client.Proposal() # Proposal | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.proposal_replace_or_create_post_proposals_replace_or_create(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_replace_or_create_post_proposals_replace_or_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Proposal**](Proposal.md)| Model instance data | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_replace_or_create_put_proposals**
> Proposal proposal_replace_or_create_put_proposals(data=data)

Replace an existing model instance or insert a new one into the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
data = swagger_client.Proposal() # Proposal | Model instance data (optional)

try: 
    # Replace an existing model instance or insert a new one into the data source.
    api_response = api_instance.proposal_replace_or_create_put_proposals(data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_replace_or_create_put_proposals: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **data** | [**Proposal**](Proposal.md)| Model instance data | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_search_text**
> InlineResponse2006 proposal_search_text()

Search text inside proposal

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()

try: 
    # Search text inside proposal
    api_response = api_instance.proposal_search_text()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_search_text: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_update_all**
> InlineResponse2002 proposal_update_all(where=where, data=data)

Update instances of the model matched by {{where}} from the data source.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Proposal() # Proposal | An object of model property name/value pairs (optional)

try: 
    # Update instances of the model matched by {{where}} from the data source.
    api_response = api_instance.proposal_update_all(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Proposal**](Proposal.md)| An object of model property name/value pairs | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **proposal_upsert_with_where**
> Proposal proposal_upsert_with_where(where=where, data=data)

Update an existing model instance or insert a new one into the data source based on the where criteria.

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ProposalApi()
where = 'where_example' # str | Criteria to match model instances (optional)
data = swagger_client.Proposal() # Proposal | An object of model property name/value pairs (optional)

try: 
    # Update an existing model instance or insert a new one into the data source based on the where criteria.
    api_response = api_instance.proposal_upsert_with_where(where=where, data=data)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ProposalApi->proposal_upsert_with_where: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | **str**| Criteria to match model instances | [optional] 
 **data** | [**Proposal**](Proposal.md)| An object of model property name/value pairs | [optional] 

### Return type

[**Proposal**](Proposal.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

