/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
chai.should();
var utils = require("./LoginUtils");

chai.use(chaiHttp);

var accessTokenArchiveManager = null;
var accessToken = null,
  id = null;

var testdataset = {
  manager: ["ingestor"],
  tapeRedundancy: "low",
  //"tapeRetentionTime": 3,
  autoArchiveDelay: 7,
  archiveEmailNotification: false,
  archiveEmailsToBeNotified: [],
  retrieveEmailNotification: false,
  retrieveEmailsToBeNotified: [],
  ownerGroup: "p10021",
  accessGroups: [],
};

const app = "http://localhost:3000";

describe("Policy: Simple Policy tests", () => {
  beforeEach((done) => {
    utils.getToken(
      app,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        utils.getToken(
          app,
          {
            username: "archiveManager",
            password: "aman",
          },
          (tokenVal) => {
            accessTokenArchiveManager = tokenVal;
            done();
          },
        );
      },
    );
  });

  it("adds a new policy", async () => {
    return request(app)
      .post("/api/v3/Policies")
      .send(testdataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("manager").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.string;
        id = encodeURIComponent(res.body["id"]);
      });
  });

  it("should fetch this new policy", async () => {
    return request(app)
      .get("/api/v3/Policies/" + id)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("updates this existing policy", async () => {
    return request(app)
      .patch("/api/v3/Policies/" + id)
      .send({ ownerGroup: "test_test" })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this policy", async () => {
    return request(app)
      .delete("/api/v3/Policies/" + id)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
