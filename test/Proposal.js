"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");

chai.use(chaiHttp);

let accessToken = null,
  defaultProposalId = null,
  proposalId = null,
  attachmentId = null;

const testproposal = {
  proposalId: "20170266",
  email: "proposer%40uni.edu",
  title: "A test proposal",
  abstract: "Abstract of test proposal",
  ownerGroup: "20170251-group",
  MeasurementPeriodList: [],
};

const app = "http://localhost:3000";

describe("Simple Proposal tests", () => {
  beforeEach((done) => {
    utils.getToken(
      app,
      {
        username: "proposalIngestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        done();
      },
    );
  });

  // the following two function definition prepare for
  // multi-delete actions to finish
  async function deleteProposal(item) {
    const response = await request(app)
      .delete("/api/v3/Proposals/" + item.proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200);

    return response;
  }

  async function processArray(array) {
    for (const item of array) {
      await deleteProposal(item);
    }
  }

  it("remove potentially existing proposals to guarantee uniqueness", async () => {
    let filter = '{"where": {"proposalId": "' + testproposal.proposalId + '"}}';
    let url = "/api/v3/Proposals?filter=" + encodeURIComponent(filter);

    return request(app)
      .get(url)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        // now remove all these entries
        processArray(res.body);
      });
  });

  it("adds a new proposal", async () => {
    return request(app)
      .post("/api/v3/Proposals")
      .send(testproposal)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        defaultProposalId = res.body["proposalId"];
        proposalId = encodeURIComponent(res.body["proposalId"]);
      });
  });

  it("should fetch this new proposal", async () => {
    return request(app)
      .get("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should add a new attachment to this proposal", async () => {
    const testAttachment = {
      thumbnail: "data/abc123",
      caption: "Some caption",
      proposalId: defaultProposalId,
      ownerGroup: "ess",
      accessGroups: ["loki", "odin"],
      createdBy: "Bertram Astor",
      updatedBy: "anonymous",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return request(app)
      .post("/api/v3/Proposals/" + proposalId + "/attachments")
      .send(testAttachment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("thumbnail")
          .and.equal(testAttachment.thumbnail);
        res.body.should.have
          .property("caption")
          .and.equal(testAttachment.caption);
        res.body.should.have
          .property("ownerGroup")
          .and.equal(testAttachment.ownerGroup);
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have
          .property("proposalId")
          .and.equal(testAttachment.proposalId);
        attachmentId = encodeURIComponent(res.body["id"]);
      });
  });

  it("should fetch this proposal attachment", async () => {
    return request(app)
      .get("/api/v3/Proposals/" + proposalId + "/attachments")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body[res.body.length - 1].id.should.be.equal(attachmentId);
      });
  });

  it("should delete this proposal attachment", async () => {
    return request(app)
      .delete(
        "/api/v3/Proposals/" + proposalId + "/attachments/" + attachmentId,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200);
  });

  it("should delete this proposal", async () => {
    return request(app)
      .delete("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
