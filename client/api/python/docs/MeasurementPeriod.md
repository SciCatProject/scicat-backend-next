# MeasurementPeriod

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** | id currently needed by limitation in embedsmanny | 
**instrument** | **str** | Instrument or beamline identifier where measurement was pursued, e.g. /PSI/SLS/TOMCAT | 
**start** | **datetime** | Time when measurement period started, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server | [optional] 
**end** | **datetime** | Time when measurement period ended, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server | [optional] 
**comment** | **str** | Additional information relevant for this measurement period, e.g. if different accounts were used for data taking | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


