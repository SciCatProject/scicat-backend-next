/* eslint-disable @typescript-eslint/no-var-requires */

describe("Users: Login with functional accounts", () => {
  it("Ingestor login fails with incorrect credentials", async () => {
    return request(appUrl)
      .post("/api/v3/Users/Login?include=user")
      .send({
        username: "ingestor",
        password: "asd123",
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
        username: "ingestor",
        password: "aman",
      })
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("user").and.be.instanceof(Object);
      });
  });

  it("Logout should succeed", async () => {
    return request(appUrl)
      .post("/api/v3/users/logout")
      .send({
        username: "ingestor",
        password: "aman",
      })
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("user").and.be.instanceof(Object);
      });
  });
});
