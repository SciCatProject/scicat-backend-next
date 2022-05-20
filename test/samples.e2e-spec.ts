import * as pactum from 'pactum';
const template_key = '@DATA:TEMPLATE@';
const override_key = '@OVERRIDES@';
const authHeader = { Authorization: 'Bearer $S{access_token}' }
const testCase = pactum.e2e('/samples');
beforeAll(async () => {
  // Log in as admin
  await pactum.spec()
    .post('/auth/login')
    .withJson({ [template_key]: 'User:admin' })
    .expectStatus(201)
    .expectBodyContains('access_token')
    .stores('access_token', 'access_token')
    .stores('userId', '_id');
});

describe('e2e test /samples endpoint', () => {
  it('POST - Adds a new sample', async () => {
    return testCase
      .step('Add sample')
      .spec()
      .post('/samples')
      .withHeaders(authHeader)
      .withJson({ [template_key]: 'Sample' })
      .stores('sampleId', 'sampleId')
      .expectJsonLike({ [template_key]: 'Sample' })
      .expectBodyContains("sampleId")
      .expectJsonMatch({ isPublished: false })
      .expectBodyContains("datasets")
      .expectStatus(201)
      .clean()
      .delete('/samples/$S{sampleId}')
      .withHeaders(authHeader)
      .expectStatus(200);
  });
  it("GET - Should fetch this new sample", async () => {
    return pactum
      .spec()
      .get('/Samples/$S{sampleId}')
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectJsonLike({ [template_key]: 'Sample' })
      .expectBodyContains("sampleId")
      .expectJsonMatch({ isPublished: false })
      .expectBodyContains("datasets")
  });
  it("PATCH /{id} - Should update sample", async () => {
    return pactum
      .spec()
      .patch('/samples/$S{sampleId}')
      .withHeaders(authHeader)
      .withJson({
        isPublished: true
      })
      .expectStatus(200)
      .expectJsonMatch({ isPublished: true });
  });
  it("POST /{id}/attachments - Should add a new attachment to this sample", async () => {
    return testCase
      .step("Add new attachment")
      .spec()
      .post('/samples/$S{sampleId}/attachments')
      .withHeaders(authHeader)
      .withJson({
        [template_key]: 'Attachment:Sample',
        [override_key]: {
          sampleId: '$S{sampleId}'
        }
      })
      .stores("attachmentId", '_id')
      .expectStatus(201)
      .expectBodyContains("id")
      .expectBodyContains("createdBy")
      .expectBodyContains("updatedBy")
      .expectJsonLike({
        [template_key]: 'Attachment:Sample',
        [override_key]: {
          sampleId: '$S{sampleId}'
        }
      })
      .clean()
      .delete('/samples/$S{sampleId}/attachments/$S{attachmentId}')
      .withHeaders(authHeader)
      .expectStatus(200);
  });
  it("GET /{id}/attachments/- Should fetch this sample attachment", async () => {
    return pactum
      .spec()
      .get('/samples/$S{sampleId}/attachments')
      .withHeaders(authHeader)
      .expectJsonMatch([{ "_id": '$S{attachmentId}' }])
      .expectBodyContains("updatedBy")
      .expectJsonLike([{
        [template_key]: 'Attachment:Sample',
        [override_key]: {
          sampleId: '$S{sampleId}'
        }
      }])
  });
  it("PATCH /{id}(attachments/{fk} - Should update attachment", async () => {
    return pactum
      .spec()
      .patch('/samples/$S{sampleId}/attachments/$S{attachmentId}')
      .withHeaders(authHeader)
      .withJson({
        thumbnail: "/data/cde456"
      })
      .expectStatus(200)
      .expectJsonMatch({
        thumbnail: "/data/cde456"
      });
  });
  it("POST /{id}/datasets - Should add a dataset to this sample", async () => {
    await testCase
      .step('Add dataset to sample')
      .spec()
      .post('/samples/$S{sampleId}/datasets')
      .withHeaders(authHeader)
      .withJson({ [template_key]: 'Dataset' })
      .stores("datasetId", 'pid')
      .expectStatus(201)
      .expectBodyContains("pid")
      .expectJsonLike({
        [template_key]: 'Dataset',
        [override_key]: {
          sampleId: '$S{sampleId}'
        }
      })
    const encodedPid = encodeURIComponent(pactum.parse('$S{datasetId}'));
    testCase.step("Clean up")
      .clean()
      .delete(`/samples/$S{sampleId}/datasets/${encodedPid}`)
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectJsonMatch({ "pid": '$S{datasetId}' });
  });
  it("GET /{id}/datasets - Should get a list of dataset related to this sample", async () => {
    return pactum
      .spec()
      .get('/samples/$S{sampleId}/datasets')
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectJsonLike([{
        [template_key]: 'Dataset',
        [override_key]: {
          sampleId: '$S{sampleId}'
        }
      }]);
  });
  it.todo("GET /fullquery - Create test for fullquery");
  it.todo("GET /metadataKeys - Create test for metadataKeys");
  it.todo("GET /findOne - Create test for findOne");
  it.todo("PATCH /{id}/datasets{fk}");
  it("Clean up", async () => {
    await testCase.cleanup();
  });
});