import * as pactum from "pactum";
describe("e2e test /auth endpoint", () => {
  const dto = {
    username: "ingestor",
    password: "aman"
  };
  const unauthorizedResBody = {
    "statusCode": 401,
    "message": "Unauthorized"
  };
  describe("/login - Login with functional accounts", () => {

    it("Ingestor login fails with incorrect credentials", async () => {
      return pactum.spec()
        .post('/auth/login')
        .withBody({ ...dto, password: "incorrect password" })
        .expectStatus(401)
        .expectBody(unauthorizedResBody);
    });
    it("Login should succeed with correct credentials", async () => {
      return pactum.spec()
        .post('/auth/login')
        .withBody(dto)
        .expectStatus(201)
        .expectBodyContains("access_token")
        .stores("access_token", "access_token");
    });
  });
  describe("/whoami - Fetch user info", () => {
    it("Should get 401 when trying to fetch user info of unauthenticated user", async () => {
      return pactum.spec()
        .get('/auth/whoami')
        .expectStatus(401)
        .expectBody(unauthorizedResBody);
    });
    it("Fetch user info of authenticated user", async () => {
      return pactum.spec()
        .get('/auth/whoami')
        .withHeaders({ Authorization: 'Bearer $S{access_token}' })
        .expectStatus(200)
        .expectJsonLike({
          "username": "ingestor",
          "email": "scicatingestor@your.site",
          "currentGroups": [
            "ingestor",
            "globalaccess"
          ]
        })
    });
  });
});
