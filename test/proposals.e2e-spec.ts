import * as pactum from 'pactum';
const template_key = '@DATA:TEMPLATE@';
const override_key = '@OVERRIDES@';
const authHeader = { Authorization: 'Bearer $S{access_token}' }
const testCase = pactum.e2e('/samples');
beforeAll(async () => {
  await pactum.spec()
    .post('/auth/login')
    .withJson({ [template_key]: 'User:admin' })
    .expectStatus(201)
    .expectBodyContains('access_token')
    .stores('access_token', 'access_token')
    .stores('userId', '_id');
});
describe('e2e test /proposals endpoint', () => {
  it('POST - Adds a new proposal', async () => {
    await testCase
      .step("Add proposal")
      .spec()
      .post('/proposals')
      .withHeaders(authHeader)
      .withJson({
        [template_key]: 'Proposal'
      })
      .stores("proposalId", "proposalId")
      .expectBodyContains("_id")
      .expectJson({ [template_key]: 'Proposal' })
      .expectStatus(200)
      .clean()
      .delete('/proposals/$S{proposalId}')
      .withHeaders(authHeader)
      .expectStatus(200)
  });
  it("GET - Should get the newly add proposal", async () => {
    return pactum
      .spec()
      .get('/proposals/$S{proposalId}')
      .withHeaders(authHeader)
      .expectJson({ [template_key]: 'Proposal' })
      .expectStatus(200);
  })
  it("Clean up", () => {
    return testCase.cleanup();
  });
});