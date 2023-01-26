/* eslint-disable @typescript-eslint/no-var-requires */

describe("Authorization functionalities", () => {
  it("Ingestor login fails with incorrect credentials", async () => {
    return request(appUrl)
      .post("/api/v3/auth/login")
      .send({
        username: "ingestor",
        password: "asd123",
      })
      .set("Accept", "application/json")
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("Logout with unauthenticated user should fail", async () => {
    return request(appUrl)
      .get("/api/v3/auth/logout")
      .set("Accept", "application/json")
      .expect(400);
  });

  it("Login should succeed with correct credentials", async () => {
    return request(appUrl)
      .post("/api/v3/auth/login")
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

  it("Logout with authenticated user should succeed", async () => {
    return request(appUrl)
      .get("/api/v3/auth/logout")
      .set("Accept", "application/json")
      .expect(200);
  });
});
