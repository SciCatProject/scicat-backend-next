import * as request from "supertest";
import { app, baseUrl } from "./test-setup";
import * as pactum from "pactum";
describe("e2e test /auth endpoint", () => {
  beforeAll(() => {
    pactum.request.setBaseUrl(baseUrl);
  })
  describe("/login - Login with functional accounts", () => {
    const dto = {
      username: "ingestor",
      password: "aman"
    };
    it.only("Ingestor login fails with incorrect credentials", async () => {
      return pactum.spec()
        .post('/auth/login')
        .withBody({ ...dto, password: "incorrect password" })
        .expectStatus(401)
        .expectBody({
          "statusCode": 401,
          "message": "Unauthorized"
        });
    });
  });
});
