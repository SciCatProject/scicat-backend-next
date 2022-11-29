# Information on Common folder

This folder contains many components and data structure that are used throughout the project


## Data Models
Data model definition covers the DTO and the model class which is used for defining the database schema and the swagger interface

### __Queryable__
This object provides the fields managed by SciCat to record who and when created and updated last the entry

__Definition__


```yaml
name: Queryable
dto:
  notes: There is no DTO as this are fields managed by SciCat
class:
  file: schemas/queryable.schema.ts
  class_name: QueryableClass
  extends: none
  model:
    notes: not applicable as this class will be extended by other classes
fields:
  - name: createBy
    type: string
    swagger:
      type: String
      description: >-
        Indicate the user who created this record. This property is added and
        mantained by the system
    model:
      type: String
      index: true
      required: true
  - name: updatedBy
    type: string
    swagger:
      type: String
      description: >-
        Indicate the user who updated this record last. This property is added
        and mantained by the system
    model:
      type: String
      required: true
  - name: createdAt
    type: Date
    swagger:
      type: Date
      description: >-
        Date and time when this record was created. This property is added and
        mantained by the system
    model:
      type: Date
      required: true
  - name: updatedAt
    type: Date
    swagger:
      type: Date
      description: >-
        Date and time when this record was updated last. This property is added
        and mantained by the system
    model:
      type: Date
      required: true
```

### __Ownable__
This object provides the fields specifing the ownership of the entry. It is used in most other entries where owner, access and instrument groups are needed

__Definition__

```yaml
name: Owenable
dto: 
  file: dto/Ownable.dto.ts
  name: OwnableDto
class:
  file: schemas/ownable.schema.ts
  name: OwnableClass
  extends: Queryable
  model:
     notes: not applicable as this class will be extended by other classes
fields:
  - name: ownerGroup
    type: string
    dto:
      type: string
      validation: IsString
    swagger:
      type: String
      description: Defines the group which owns the data, and therefore has unrestricted access to this data. Usually a pgroup like p12151
    model:
      type: String
      index: true
  - name: accessGroups
    type: strings[]
    default: []
    dto:
      validation: IsString
      decorators: IsOptional
    swagger:
      type: [String]
      description: Optional additional groups which have read access to the data. Users which are member in one of the groups listed here are allowed to access this data. The special group 'public' makes data available to all users
    model:
      type: [String]
      index: true
  - name: instrumentGroup
    type: string
    optional: true
    dto:
      validation: IsString
      decorators: IsOptional
    swagger:
      type: String
      required: false
      description: Optional additional groups which have read and write access to the data. Users which are member in one of the groups listed here are allowed to access this data.
    model:
      type: String, 
      required: false
```
