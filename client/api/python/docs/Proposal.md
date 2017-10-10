# Proposal

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**proposalId** | **str** | Globally unique identifier of a proposal, eg. PID-prefix/internal-proposal-number. PID prefix is auto prepended | 
**pi_email** | **str** | Email of principal investigator | [optional] 
**pi_firstname** | **str** | First name of principal investigator | [optional] 
**pi_lastname** | **str** | Last name of principal investigator | [optional] 
**email** | **str** | Email of main proposer | 
**firstname** | **str** | First name of main proposer | [optional] 
**lastname** | **str** | Last name of main proposer | [optional] 
**title** | **str** |  | [optional] 
**abstract** | **str** |  | [optional] 
**attachments** | **list[str]** | Array of URLs pointing to attached documents | [optional] 
**ownerGroup** | **str** | Defines the group which owns the data, and therefore has unrestricted access to this data. Usually a pgroup like p12151 | 
**accessGroups** | **list[str]** | Optional additional groups which have read access to the data. Users which are member in one of the groups listed here are allowed to access this data. The special group &#39;public&#39; makes data available to all users | [optional] 
**createdAt** | **datetime** |  | [optional] 
**updatedAt** | **datetime** |  | [optional] 
**MeasurementPeriodList** | [**list[MeasurementPeriod]**](MeasurementPeriod.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


