# Published Data API v4 Resource-ID Validation – Completion Plan

**Document ID**: `published_data_plan_1_20261006.md`  
**Created**: 2026-10-06  
**Status**: Planned  
**Scope**: Published Data API v4 resource-ID changes only  
**Related plans**:
- `published_data_plan_1_20261002.md`
- `published_data_plan_1_20261005.md`
- `published_data_plan_1_20261005_2.md`

## 1. Objective

Complete and verify the API v4 Published Data changes so that:

1. `datasetPids`, `proposalIds`, `sampleIds`, and `instrumentIds` are optional fields.
2. A create request must contain at least one non-empty resource ID across the four fields.
3. An update request must leave the final Published Data document with at least one non-empty resource ID.
4. Existing documents and existing dataset-only workflows remain compatible.
5. The application compiles and the relevant unit/API tests pass.

This plan does **not** cover the separate authorization or DataCite synchronization workstream in `published_data_plan_2_20261002.md`.

## 2. Current blockers and design decisions

### 2.1 Build blockers to resolve

`npm run build` currently fails in:

- `src/published-data/pipes/at-least-one-resource.pipe.ts`
  - `Object.entries(value)` infers values as `{}`, so `val?.length` is invalid.
- `src/published-data/published-data.v4.controller.ts:464`
  - `datasetPids` is optional but is mapped without a fallback.
- `src/published-data/published-data.v4.controller.ts:604`
  - `publishedData.datasetPids` is optional but is mapped without a fallback.

The implementation is not complete until `npm run build` succeeds.

### 2.2 Validation behavior

The business rule applies to the **aggregate/final resource state**, not to every individual field:

- Omitted fields are valid.
- Empty arrays are valid when another ID field contains a valid ID.
- Arrays containing non-string values are invalid DTO input.
- Arrays containing only empty or whitespace strings do not satisfy the business rule.
- A PATCH that changes only title, abstract, metadata, or status is valid if the existing document already has a valid resource ID.
- A PATCH that explicitly removes all resource IDs must be rejected.

Therefore, the controller-level pipe should not require an ID in every incoming PATCH body. Final-state validation belongs after merging the PATCH with the existing document, with service-level validation retained as defense in depth.

## 3. Implementation steps

### Step 1 – Make resource-ID handling type-safe

**Files:**
- `src/published-data/pipes/at-least-one-resource.pipe.ts`
- `src/published-data/published-data.v4.controller.ts`

Actions:

1. Define a small typed input shape for the four ID fields, or safely treat the pipe input as an object.
2. Ensure the pipe does not access properties on `undefined`, `null`, or non-object input.
3. Avoid `val?.length` on an untyped `{}` value. Use an explicit array guard, for example a helper equivalent to:
   - `Array.isArray(value) && value.length > 0`
4. Keep string-content checking in one shared helper where practical.
5. Update the two controller dataset loops to use a safe fallback (`publishedData.datasetPids ?? []` or equivalent).
6. Search for all other `datasetPids` usages affected by the optional schema field and fix any remaining unsafe access.

Acceptance criteria:

- `npm run build` no longer reports optional `datasetPids` errors.
- The pipe returns a structured `BadRequestException` for a missing/empty resource set rather than throwing a TypeError.

### Step 2 – Correct DTO validation semantics

**File:** `src/published-data/dto/update-published-data.v4.dto.ts`

Actions:

1. Keep all four fields optional with `@IsOptional()`, `@IsArray()`, and `@IsString({ each: true })`.
2. Remove per-field `@ArrayMinSize(1)` if it prevents valid combinations containing empty arrays.
3. If minimum-size validation is retained, ensure it is only applied where the field is intentionally supplied and confirm that payloads such as the following pass:

```json
{
  "datasetPids": [],
  "proposalIds": ["proposal-1"],
  "sampleIds": [],
  "instrumentIds": []
}
```

4. Preserve the aggregate “at least one valid ID” rule in the final-state validation logic rather than encoding it as four independent array minimum rules.

Acceptance criteria:

- Each ID field may be omitted or supplied as an empty array.
- A supplied array must contain strings.
- A request with one valid ID field and other empty arrays passes DTO validation.

### Step 3 – Separate create and update validation behavior

**Files:**
- `src/published-data/published-data.v4.controller.ts`
- `src/published-data/pipes/at-least-one-resource.pipe.ts`
- `src/published-data/published-data.service.ts`

Actions:

1. Apply aggregate resource validation to create requests.
2. For PATCH requests, do not reject a body solely because it contains no resource-ID fields.
3. Load the existing document, merge the update with it, and validate the merged result before saving.
4. Keep service-level validation as a second layer.
5. Ensure explicit clearing of all four fields is rejected:

```json
{
  "datasetPids": [],
  "proposalIds": [],
  "sampleIds": [],
  "instrumentIds": []
}
```

6. Ensure an update that changes only non-resource fields succeeds when the existing document already has a valid resource ID.
7. Ensure the service does not silently allow an update when the target document is absent; preserve the controller’s not-found behavior and keep service behavior consistent.

Recommended shape:

- Create: pipe or controller validation + service validation.
- Update: DTO validation → load existing record → merge → aggregate validation → service update.

Acceptance criteria:

- Valid title-only and metadata-only PATCH requests succeed for a document with valid IDs.
- PATCH requests that remove all IDs fail with HTTP 400 and the documented error code.
- Updates containing only one new ID type are accepted.

### Step 4 – Fix and review the migration

**File:**
- `migrations/20261005113000-add-optional-id-fields-to-published-data.js`

Actions:

1. Correct the partial-field query. It must identify documents where at least one field is missing, without requiring all fields to exist at the same time.
2. Do not overwrite populated fields when only another field is missing.
3. Use separate updates for each missing field, or an aggregation pipeline that applies `$ifNull` safely to each field.
4. Verify that existing `datasetPids` values are never changed.
5. Verify that existing `proposalIds`, `sampleIds`, or `instrumentIds` values are never replaced by `[]`.
6. Review the `down` migration behavior and document that removing fields cannot restore Mongoose’s prior required-schema setting by itself.
7. If migration tests are feasible in this repository, add a focused test using documents with:
   - all fields absent;
   - one new field populated and two absent;
   - all fields populated;
   - an existing `datasetPids` array.

Acceptance criteria:

- Running `up` gives every document all three new fields.
- Existing populated values remain unchanged.
- Running `up` is safe to run against already-migrated documents.

### Step 5 – Add focused unit tests

Add or extend tests for the pipe and service.

#### 5.1 Pipe tests

**Suggested file:** `src/published-data/pipes/at-least-one-resource.pipe.spec.ts`

Cover:

- `datasetPids` only;
- `proposalIds` only;
- `sampleIds` only;
- `instrumentIds` only;
- multiple ID fields;
- omitted fields;
- all fields omitted;
- all fields as empty arrays;
- arrays containing only empty strings;
- arrays containing only whitespace strings;
- one valid ID alongside empty arrays;
- `null`/`undefined` input handling;
- malformed non-array values, if the pipe is expected to defend against pre-validation input.

Assert both acceptance and the error code/message:

- `NO_RESOURCE_IDS_PROVIDED`
- message identifies the four accepted resource fields.

#### 5.2 Service tests

**Files:**
- `src/published-data/published-data.service.spec.ts`
- any existing v4 controller spec as appropriate

Cover:

- create succeeds with each ID field individually;
- create rejects when all fields are absent or empty;
- create rejects whitespace-only IDs;
- update preserves existing IDs when the PATCH omits resource fields;
- update succeeds when one resource field is replaced with valid IDs;
- update rejects an update whose merged final state has no valid IDs;
- update handles an existing document using legacy dataset-only data.

Mocks should assert both the merge calculation and the actual model update call.

### Step 6 – Add API/e2e coverage

**File:** `test/PublishedDataV4.js`

Add tests for the actual v4 API route used by the repository’s test configuration.

#### Valid creation cases

- dataset IDs only;
- proposal IDs only;
- sample IDs only;
- instrument IDs only;
- multiple ID fields;
- omitted optional ID fields except for one valid field.

#### Invalid creation cases

- no ID fields;
- all fields as empty arrays;
- whitespace-only IDs;
- empty-string-only IDs;
- wrong field types, such as a scalar instead of an array;
- array containing a non-string value.

#### Update cases

- title-only update of a document with existing IDs;
- metadata-only update of a document with existing IDs;
- update replacing dataset IDs with proposal IDs;
- update clearing one field while another remains populated;
- update clearing all four fields, expecting HTTP 400;
- update with whitespace-only replacement IDs, expecting HTTP 400.

Use isolated records or clean up created records so tests do not depend on execution order. Avoid mutating shared `TestData` objects between tests unless they are cloned deeply.

Assertions should verify:

- HTTP status;
- response content type;
- returned resource arrays;
- `NO_RESOURCE_IDS_PROVIDED` on invalid requests;
- no database update occurs after a rejected update where practical.

### Step 7 – Verify compatibility and quality

Run, in order:

```bash
npm run build
npm test -- --runInBand
npm run test:api:jest -- --runInBand
```

Run the Mocha API suite if the environment/database is available:

```bash
npm run test:api:mocha
```

Also run targeted checks during development:

```bash
npx jest src/published-data --runInBand
```

Review:

- TypeScript compilation;
- linting and formatting for changed TypeScript files;
- Swagger/OpenAPI output for optional ID fields;
- migration status and migration behavior against a representative database;
- legacy Published Data records containing only `datasetPids`.

## 4. Completion checklist

### Code

- [ ] Build errors fixed.
- [ ] All `datasetPids` accesses are safe when the field is absent.
- [ ] DTOs permit omitted and empty individual arrays.
- [ ] Create validates at least one valid resource ID.
- [ ] Update validates the merged final state, not only the PATCH body.
- [ ] Service validation remains active.
- [ ] Migration does not overwrite existing populated fields.

### Tests

- [ ] Pipe unit tests added.
- [ ] Service tests cover create and final-state update validation.
- [ ] API tests cover each ID type individually.
- [ ] API tests cover empty, missing, whitespace, and malformed values.
- [ ] API tests cover non-resource partial updates.
- [ ] API tests cover removal of all IDs.
- [ ] Existing Published Data tests pass.

### Verification

- [ ] `npm run build` passes.
- [ ] Unit tests pass.
- [ ] v4 API tests pass.
- [ ] Migration reviewed/tested.
- [ ] No v5 behavior or unrelated authorization/DataCite work introduced.

## 5. Definition of done

The implementation is complete when the build passes, all existing tests remain green, the new unit/API tests cover the validation matrix above, and the v4 endpoint enforces the resource-ID invariant based on the final document state while preserving valid legacy and partial-update behavior.
