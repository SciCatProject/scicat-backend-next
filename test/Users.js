/* eslint-disable @typescript-eslint/no-var-requires */

describe("Users: Login with functional accounts", () => {
  it("Admin ingestor login fails with incorrect credentials", async () => {
    return request(appUrl)
      .post("/api/v3/Users/Login?include=user")
      .send({
        username: "adminIngestor",
        password: "7fdcde6002ac5bb3ee3a196cd2424f31",
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
        password: "13f4242dc691a3ee3bb5ca2006edcdf7",
      })
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("user").and.be.instanceof(Object);
      });
  });
});
