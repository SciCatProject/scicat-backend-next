import * as pactum from 'pactum';
const template_key = '@DATA:TEMPLATE@';
const override_key = '@OVERRIDES@';
beforeAll(async () => {
  await pactum.spec()
    .post('/auth/login')
    .withJson({ [template_key]: 'User:admin' })
    .expectStatus(201)
    .expectBodyContains("access_token")
    .stores("access_token", "access_token")
    .stores("userId", "_id");
  pactum.handler.addCaptureHandler('encodePid', (ctx: any) => {
    return encodeURIComponent(ctx.res.body.pid);
  });
});
describe("e2e test /datasets endpoint", () => {
  const authHeader = { Authorization: 'Bearer $S{access_token}' }
  const testCase = pactum.e2e('Add Dataset');
  it("POST - Should add a new dataset", async () => {
    await testCase.step('Add dataset')
      .spec()
      .post('/datasets')
      .withHeaders(authHeader)
      .withJson({ [template_key]: 'Dataset' })
      .expectStatus(200)
      .stores('datasetId', 'pid')
      .stores('encodedPid', '#encodePid')
      .expectBodyContains('pid')
      .expectJsonLike({ [template_key]: 'Dataset' })
      .clean()
      .delete(`/datasets/$S{encodedPid}`)
      .withHeaders(authHeader)
      .expectStatus(200);
  });
  it("GET - should fetch the new dataset", async () => {
    return pactum
      .spec()
      .get(`/datasets/$S{encodedPid}`)
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectBodyContains("unitSI")
      .expectBodyContains("valueSI")
      .expectJsonLike({ [template_key]: 'Dataset' })
  });

  it("POST /{id}/attachments - should add a new attachment to this dataset", async () => {
    return testCase.step('Add attachment')
      .spec()
      .post('/datasets/$S{encodedPid}/attachments')
      .withHeaders(authHeader)
      .withJson({
        [template_key]: 'Attachment:Dataset',
        [override_key]: {
          datasetId: '$S{datasetId}',
        }
      })
      .stores("attachmentId", "_id")
      .expectStatus(200)
      .expectBodyContains("_id")
      .expectJsonLike({
        [template_key]: 'Attachment:Dataset',
        [override_key]: {
          datasetId: '$S{datasetId}',
        }
      })
      .clean()
      .delete('/datasets/$S{encodedPid}/attachments/$S{attachmentId}')
      .withHeaders(authHeader)
      .expectStatus(200);
  });
  it("GET /{id}/attachments - Should get the newly added attachment to this dataset", async () => {
    return testCase.step('Add attachment')
      .spec()
      .get('/datasets/$S{encodedPid}/attachments')
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectJsonLike([{
        [template_key]: 'Attachment:Dataset',
        [override_key]: {
          datasetId: '$S{datasetId}',
        }
      }])
  });
  it("GET - Fetch datasets filtered with datasetName", async () => {
    const filter = JSON.stringify({ where: { datasetName: 'test-dataset' } });
    return pactum
      .spec()
      .get(`/datasets?filter=${encodeURIComponent(filter)}`)
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectJsonLike([{ [template_key]: 'Dataset' }])
  });

  it("POST - Should fail creating a dataset with non unique techniques", async () => {
    await pactum
      .spec()
      .post('/datasets')
      .withHeaders(authHeader)
      .withJson({
        [template_key]: 'Dataset',
        [override_key]: {
          techniques: '$M{DatasetNonUniqueTechniques}'
        }
      })
      .expectStatus(422)
      .expectBodyContains("contains duplicate `pid`")
      .expectBodyContains("efficientUniqueness")
  });
  it('clean up', async () => {
    await testCase.cleanup();
  });
});
