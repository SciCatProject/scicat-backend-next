/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

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

describe("1300: Policy: Simple Policy tests", () => {
  before(() => {
    db.collection("Policy").deleteMany({});
  });
  beforeEach(async() => {
    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
  });
  
  it("0010: adds a new policy", async () => {
    return request(appUrl)
      .post("/api/v3/Policies")
      .send(testdataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("manager").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.string;
        id = encodeURIComponent(res.body["id"]);
      });
  });

  it("0020: should fetch this new policy", async () => {
    return request(appUrl)
      .get("/api/v3/Policies/" + id)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0030: updates this existing policy", async () => {
    return request(appUrl)
      .patch("/api/v3/Policies/" + id)
      .send({ ownerGroup: "test_test" })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0040: should delete this policy", async () => {
    return request(appUrl)
      .delete("/api/v3/Policies/" + id)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
