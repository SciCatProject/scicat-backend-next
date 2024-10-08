/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const { TestData } = require("./TestData");
const utils = require("./LoginUtils");

let userIdUser1 = null,
  accessTokenUser1 = null;

describe("2350: Users: Login with functional accounts", () => {
  it("0010: Admin ingestor login fails with incorrect credentials", async () => {
    return request(appUrl)
      .post("/api/v3/auth/Login?include=user")
      .send({
        username: "adminIngestor",
        password: TestData.Accounts["user1"]["password"],
      })
      .set("Accept", "application/json")
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0020: Login should succeed with correct credentials", async () => {
    return request(appUrl)
      .post("/api/v3/auth/Login?include=user")
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

describe("2360: Users settings", () => {
  beforeEach(async () => {
    const loginResponseUser1 = await utils.getIdAndToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });
    userIdUser1 = loginResponseUser1.userId;
    accessTokenUser1 = loginResponseUser1.token;
  });

  it("0020: Update users settings with valid value should success ", async () => {
    return request(appUrl)
      .put(`/api/v3/Users/${userIdUser1}/settings`)
      .send(TestData.userSettingsCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("userId", userIdUser1);
        res.body.should.have.property("datasetCount");
        res.body.should.have.property("jobCount");
        res.body.should.have.property("externalSettings");
      });
  });

  it("0030: Patch users settings with valid value should success ", async () => {
    return request(appUrl)
      .patch(`/api/v3/Users/${userIdUser1}/settings`)
      .send(TestData.userSettingsCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("userId", userIdUser1);
        res.body.should.have.property("datasetCount");
        res.body.should.have.property("jobCount");
        res.body.should.have.property("externalSettings");
      });
  });

  it("0040: Patch users external settings with valid value should success ", async () => {
    return request(appUrl)
      .patch(`/api/v3/Users/${userIdUser1}/settings/external`)
      .send(TestData.userSettingsCorrect.externalSettings)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("userId", userIdUser1);
        res.body.should.have.property("datasetCount");
        res.body.should.have.property("jobCount");
        res.body.should.have.property("externalSettings");
      });
  });
});
