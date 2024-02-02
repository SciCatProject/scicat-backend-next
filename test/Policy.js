/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");

var accessTokenArchiveManager = null;
var accessTokenAdminIngestor = null,
  id = null;

var testdataset = {
  manager: ["adminIngestor"],
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

describe("Policy: Simple Policy tests", () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "adminIngestor",
        password: "13f4242dc691a3ee3bb5ca2006edcdf7",
      },
      (tokenVal) => {
        accessTokenAdminIngestor = tokenVal;
        utils.getToken(
          appUrl,
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
    return request(appUrl)
      .post("/api/v3/Policies")
      .send(testdataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("manager").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.string;
        id = encodeURIComponent(res.body["id"]);
      });
  });

  it("should fetch this new policy", async () => {
    return request(appUrl)
      .get("/api/v3/Policies/" + id)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("updates this existing policy", async () => {
    return request(appUrl)
      .patch("/api/v3/Policies/" + id)
      .send({ ownerGroup: "test_test" })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this policy", async () => {
    return request(appUrl)
      .delete("/api/v3/Policies/" + id)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
