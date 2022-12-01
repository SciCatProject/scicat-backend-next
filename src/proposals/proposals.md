# Information on Proposals folder

This folder contains all the information and files related to Proposals models and their endpoints .

## Data Models

### __Proposal__
This object define all the Proposal class models and dtos.

__Definition__

```yaml
item: Proposal
dto: 
  file: proposals/dto/create-proposal.dto.ts
  name: ProposalDto
  extends: OwnableDto
model:
  file: proposals/schemas/proposal.schema.ts
  names: 
    class: ProposalClass
    schema: ProposalSchema
  extends: OwnableClass
  database:
    collection: Proposal
    toJson:
      getters: true
legacy:
  file: common/models/proposal.json
fields:
  - name: proposalId
    type: string
    legacy:
      type: string
      id: true
      required: true
      description: "Globally unique identifier of a proposal, eg. PID-prefix/internal-proposal-number. PID prefix is auto prepended"
    dto:
      type: string
      readonly: true
      validation: 
        IsString: true
      swagger:
        type: String
        required: true
        description: "Globally unique identifier of a proposal, eg. PID-prefix/nternal-proposal-number. PID prefix is auto prepended" 
    schema:
      type: string
      swagger:
        type: String
        required: true
        description: "Globally unique identifier of a proposal, eg. PID-prefix/nternal-proposal-number. PID prefix is auto prepended"
      database:
        type: String
        unique: true
        required: true
  - name: _id
    type: string
    schema:
      type: string
      database:
        type: String
  - name: pi_email
    type: string
    optional: true
    legacy:
      type: string
      index: true
      description: "Email of principal investigator"
    dto:
      type: string
      readonly: true
      validation:
        IsString: true
        IsOptional: true
      swagger:
        type: String,
        required: false,
        description: "Email of principal investigator"      
    schema:
      type: string
      swagger:
        type: String,
        required: false,
        description: "Email of principal investigator"
      database:
        type: String,
        required: false,
        index: true,
  - name: pi_firstname
    type: string
    optional: true
    legacy:
      type: string
      description: "First name of principal investigator"
    dto:
      type: string
      readonly: true
      validation:
        IsString: true
        IsOptional: true
      swagger:
        type: String,
        required: false,
        description: "First name of principal investigator"
    schema:
      type: string
      swagger:
        type: String,
        required: false,
        description: "First name of principal investigator"
      database:
        type: String,
        required: false
  - name: pi_lastname
    type: string
    optional: true
    legacy: 
      type: string
      description: "Last name of principal investigator"
    dto:
      type: string
      readonly: true
      validation:
        IsString: true
        IsOptional: true
      swagger:
        type: String
        required: false
        description: "Last name of principal investigator"
    schema:
      swagger:
        type: String
        required: false
        description: "Last name of principal investigator"
      database:
        type: String,
        required: false
  - name: email
    type: string
    legacy:
      type: string
      required: true,
      description: "Email of main proposer"
    dto:
      type: string
      readonly: true
      validation:
        IsEmail: true
      swagger:
        type: String
        required: true
        description: "Email of main proposer"
    schema:
      swagger:
        type: String
        required: true
        description: "Email of main proposer"
      database:
        type: String 
        required: true 
  - name: firstname
    type: string
    optional: true
    legacy:
      type: string
      description: "First name of main proposer"
    dto:
      type: string
      validation:
        IsString: true
        IsOptional: true
      swagger:
        type: String
        required: false
        description: "First name of main proposer" 
    schema:
      swagger:
        type: String
        required: false
        description: "First name of main proposer" 
      database:
        type: String, 
        required: false 
  - name: lastname
    type: string
    optional: true
    legacy:
      type: string
      description: "Last name of main proposer"      
    dto:
      type: string
      readonly: true
      validation:
        IsString: true
        IsOptional: true
      swagger:
        type: String
        required: false
        description: "Last name of main proposer"
    schema:
      swagger:
        type: String
        required: false
        description: "Last name of main proposer"
      database:
        type: String
        required: false 
  - name: title
    type: string
    legacy:
      type: string
    dto:
      type: string
      readonly: true
      validation:
        IsString: true
      swagger:
        type: String
        required: true
        description: "The title of the proposal"
    schema:
      swagger:
        type: String
        required: true
        description: "The title of the proposal"
      database:
        type: String 
        required: true 
  - name: abstract
    type: string
    optional: true
    legacy:
      type: string
    dto:
      type: string
      readonly: true
      validation:
        IsString: true
        IsOptional: true
      swagger:
        type: String
        required: true
        description: "The proposal abstract"
    schema:
      swagger:
        type: String 
        required: false
        description: "The proposal abstract" 
      database:
        type: String
        required: false 
  - name: startTime
    type: Date
    optional: true
    legacy:
      type: Date
    dto:
      type: Date
      readonly: true
      required: false
      validation:
        IsDateString: true
        IsString: true
      swagger:
        type: Date
        required: false
        description: "The date when the data collection starts"
    schema:
      swagger:
        type: Date
        required: false
        description: "The date when the data collection starts"
      database:
        type: Date, 
        required: false 
  - name: endTime
    type: Date
    optional: true
    legacy:
      type: Date
    dto:
      type: Date
      readonly: true
      optional: true
      validation:
        IsDateString: true
        IsString: true
      swagger:
        type: Date
        required: false
        description: "The date when data collection finishes"
    schema:
      swagger:
        type: Date
        required: false
        description: "The date when data collection finishes"
      database:
        type: Date 
        required: false 
  - name: MeasurementPeriodList
    type: MeasurementPeriod
    optional: true
    array: true
    legacy:
      relationship: measurementPeriod
      type: embedsMany
      model: MeasurementPeriod
      property: MeasurementPeriodList
      options:
        validate: false
        forceId: false
        persistent: true
    dto:
      type: Record<string, unknown>
      readonly: true
      optional: true
      validation:
        IsOptional: true
        IsArray: true
        ValidateNested: 
          each: true
        Type: CreateMeasurementPeriodDto
      swagger:
        type: MeasurementPeriod
        isArray: true
        required: false
        description: "Embedded information used inside proposals to define which type of experiment as to be pursued where (at which intrument) and when."
    schema:
      swagger:
        type: MeasurementPeriod
        isArray: true
        required: false
        description: "Embedded information used inside proposals to define which type of experiment as to be pursued where (at which intrument) and when."
      database:
        type: MeasurementPeriodSchema
        array: true
        required: false
  - name: Attachements
    legacy:
      type: hasMany
      model: Attachment
```

### __MeasurementPeriood__
This object define the Measurement Period object

__Definition__

```yaml
item: 
dto: 
  file: proposals/dto/create-proposal.dto.ts
  name: ProposalDto
  extends: OwnableDto
model:
  file: proposals/schemas/measurement-period.schema.ts
  names: 
    class: MeasurementPeriodClass
    schema: MeasurementPeriodSchema
  extends: QueryableClass
legacy:
  file: common/models/proposal.json
fields:
  - name: proposalId
    type: string
    legacy:
      type: string
      id: true
      required: true
      description: "Globally unique identifier of a proposal, eg. PID-prefix/internal-proposal-number. PID prefix is auto prepended"
    dto:
      type: string
      readonly: true
      validation: 
        IsString: true
      swagger:
        type: String
        required: true
        description: "Globally unique identifier of a proposal, eg. PID-prefix/nternal-proposal-number. PID prefix is auto prepended" 
    schema:
      type: string
      swagger:
        type: String
        required: true
        description: "Globally unique identifier of a proposal, eg. PID-prefix/nternal-proposal-number. PID prefix is auto prepended"
      database:
        type: String
        unique: true
        required: true
