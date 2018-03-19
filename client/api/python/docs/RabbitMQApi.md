# swagger_client.RabbitMQApi

All URIs are relative to *https://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**rabbit_mq_queues**](RabbitMQApi.md#rabbit_mq_queues) | **GET** /RabbitMQ/queues | Get queues of connected rabbitmq server
[**rabbit_mq_status**](RabbitMQApi.md#rabbit_mq_status) | **GET** /RabbitMQ/status | Get an status overview of the connected rabbitmq server


# **rabbit_mq_queues**
> list[object] rabbit_mq_queues()

Get queues of connected rabbitmq server

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RabbitMQApi()

try: 
    # Get queues of connected rabbitmq server
    api_response = api_instance.rabbit_mq_queues()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RabbitMQApi->rabbit_mq_queues: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

**list[object]**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rabbit_mq_status**
> object rabbit_mq_status()

Get an status overview of the connected rabbitmq server

### Example 
```python
from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.RabbitMQApi()

try: 
    # Get an status overview of the connected rabbitmq server
    api_response = api_instance.rabbit_mq_status()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling RabbitMQApi->rabbit_mq_status: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, application/xml, text/xml
 - **Accept**: application/json, application/xml, text/xml, application/javascript, text/javascript

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

