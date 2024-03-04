/* eslint-disable @typescript-eslint/no-var-requires */
const { TestData } = require("./TestData");

describe("Users: Login with functional accounts", () => {
  it("Admin ingestor login fails with incorrect credentials", async () => {
    return request(appUrl)
      .post("/api/v3/Users/Login?include=user")
      .send({
        username: "adminIngestor",
        password: TestData.Accounts["user1"]["password"],
      })
      .set("Accept", "application/json")
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("Login should succeed with correct credentials", async () => {
    return request(appUrl)
      .post("/api/v3/Users/Login?include=user")
      .send({
        username: "adminIngestor",
        password: TestData.Accounts["adminIngestor"]["password"],
      })
      .set("Accept", "application/json")
      .expect(TestData.LoginSuccessfulStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("user").and.be.instanceof(Object);
      });
  });
});
