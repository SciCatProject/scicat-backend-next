import * as pactum from "pactum";
const template_key = '@DATA:TEMPLATE@';
const override_key = '@OVERRIDES@';
const authHeader = { Authorization: 'Bearer $S{access_token}' }
beforeAll(async () => {
  await pactum.spec()
    .post('/auth/login')
    .withJson({ [template_key]: 'User:admin' })
    .expectStatus(201)
    .expectBodyContains('access_token')
    .stores('access_token', 'access_token')
    .stores('userId', '_id');
});
describe("/useridentities", () => {
  it("GET /findOne - Should get user info of the authenticated user ", async () => {
    const encodedFilter = encodeURIComponent(
      JSON.stringify({ where: { _id: pactum.parse("$S{userId}") } })
    );
    return pactum
      .spec()
      .get(`/useridentities/findOne?filters=${encodedFilter}`)
      .withHeaders(authHeader)
      .expectStatus(200)
      .expectBodyContains("_id")
    //TODO: more expect should be added
  });
});