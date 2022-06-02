import * as pactum from "pactum";
const template_key = '@DATA:TEMPLATE@';
const override_key = '@OVERRIDES@';
beforeAll(async () => {
  await pactum.spec()
    .post('/auth/login')
    .withJson({
      [template_key]: "User:ingestor"
    })
    .expectStatus(201)
    .expectBodyContains("access_token")
    .stores("access_token", "access_token")
    .stores("userId", "_id");
});
describe("e2e test /users endpoint", () => {
  const unauthorizedResBody = {
    "statusCode": 401,
    "message": "Unauthorized"
  };
  it("POST /jwt - Should get jwt for anonymous user when trying to fetch access token as unauthenticated user", async () => {
    await pactum.spec()
      .post('/users/jwt')
      .expectStatus(201)
      .expectBodyContains('jwt')
      .stores('anonymous_access_token', 'jwt');
    return pactum.spec()
      .get('/auth/whoami')
      .expectStatus(200)
      .withHeaders({ Authorization: 'Bearer $S{anonymous_access_token}' })
      .expectBody({
        username: "anonymous",
        currentGroups: []
      });
  });
  it("POST - Should get jwt for ingestor user when trying to fetch access token as authenticated user", async () => {
    const res = await pactum.spec()
      .post('/users/jwt')
      .withHeaders({ Authorization: 'Bearer $S{access_token}' })
      .expectStatus(201)
      .expectBodyContains('jwt')
      .stores('jwt', 'jwt')
    return pactum.spec()
      .get('/auth/whoami')
      .expectStatus(200)
      .withHeaders({ Authorization: 'Bearer $S{access_token}' })
      .expectJsonLike({
        username: "ingestor",
        email: "scicatingestor@your.site",
        currentGroups: ["ingestor", "globalaccess"],
      })
  });
  it("GET /{id} - Should get user info for the authenticated user", async () => {
    const res = await pactum.spec()
      .get('/users/$S{userId}')
      .withHeaders({ Authorization: 'Bearer $S{access_token}' })
      .expectStatus(200)
      .expectJsonLike({
        "username": "ingestor",
        "email": "scicatingestor@your.site"
      })
      .toss();
    expect(res.body).not.toContain("password");
  });
  it("GET /{id} - Should get 401 for the unthenticated user", async () => {
    return pactum.spec()
      .get('/users/$S{userId}')
      .expectStatus(401)
      .expectBody(unauthorizedResBody)
  });
  it.todo("GET /{id}/userIdentity - Should get user identity for authenticated user"
    // , async () => {
    //   return pactum.spec()
    //     .get('/users/$S{userId}/useridentity')
    //     .withHeaders({ Authorization: 'Bearer $S{access_token}' })
    //     .expectStatus(200)
    //     .expectBodyContains('username')
    // }
  );
  it("GET /{id}/userIdentity - Should get 401 for authenticated user", async () => {
    return pactum.spec()
      .get('/users/$S{userId}/useridentity')
      .expectStatus(401)
      .expectBodyContains(unauthorizedResBody);
  });
  it("GET /{id}/settings - Should get user settings for authenticated user", async () => {
    return pactum.spec()
      .get('/users/$S{userId}/settings')
      .withHeaders({ Authorization: 'Bearer $S{access_token}' })
      .expectStatus(200)
      .expectBodyContains('column')
      .expectBodyContains('datasetCount')
      .expectBodyContains('jobCount')
      .expectBodyContains('userId');
  });

  it("GET /{id}/settings - Should get 401 for authenticated user", async () => {
    return pactum.spec()
      .get('/users/$S{userId}/settings')
      .expectStatus(401)
      .expectBody(unauthorizedResBody);
  });

  it("POST /{id}/settings - Should create user settings for authenticated user", async () => {
    return pactum.spec()
      .post('/users/$S{userId}/settings')
      .withHeaders({ Authorization: 'Bearer $S{access_token}' })
      .expectStatus(201)
      .expectBodyContains('column')
      .expectBodyContains('datasetCount')
      .expectBodyContains('jobCount')
      .expectBodyContains('userId');
  });
  it("POST /{id}/settings - Should not create user settings for unauthenticated user", async () => {
    return pactum.spec()
      .post('/users/$S{userId}/settings')
      .expectStatus(401);
  });
  it("PATCH /users/{id}/settings - Should update user settings for authenticated user", async () => {
    return pactum.spec()
      .patch('/users/$S{userId}/settings')
      .withHeaders({ Authorization: 'Bearer $S{access_token}' })
      .withBody({
        "datasetCount": 30,
      })
      .expectJsonLike({
        "datasetCount": 30
      });
  }
  );
  it.todo("/users/{id}/settings - Should delete user settings for authorized user");
  it.todo("/users/{id}/settings - Should get 401 user settings for unauthorized user");
  it.todo("/users/{id}/settings - Should get 401 user settings for unauthenticated user");
});


