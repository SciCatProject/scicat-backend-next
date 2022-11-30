/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
chai.should();
const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

chai.use(chaiHttp);

let accessToken = null,
  defaultProposalId = null,
  proposalId = null,
  attachmentId = null;

const app = "http://localhost:3000";

describe("Proposal: Simple Proposal", () => {
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
    return request(app)
      .get("/api/v3/Proposals")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        // now remove all these entries
        processArray(res.body);
      });
  });

  // check if proposal is valid
  it("check if minimal proposal is valid", async () => {
    return request(app)
      .post("/api/v3/Proposals/isValid")
      .send(TestData.ProposalCorrectMin)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("adds a new proposal with minimal data", async () => {
    return request(app)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectMin)
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

  // check if proposal is valid
  it("check if complete proposal is valid", async () => {
    return request(app)
      .post("/api/v3/Proposals/isValid")
      .send(TestData.ProposalCorrectComplete)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("adds a new proposal with complete data", async () => {
    return request(app)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectComplete)
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

  // check if proposal with additional field is valid
  it("check if complete proposal with extra field is valid", async () => {
    return request(app)
      .post("/api/v3/Proposals/isValid")
      .send(TestData.ProposalWring_1)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("adds a new complete proposal with an extra field, which should fail", async () => {
    return request(app)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalWring_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.equal(200);
      });
  });

  it("should fetch this new proposal", async () => {
    return request(app)
      .get("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("createdBy").and.be.string;
        res.body.should.have.property("updatedBy").and.be.string;
      });
  });

  it("should add a new attachment to this proposal", async () => {
    let testAttachment = TestData.AttachmentCorrect;
    testAttachment.proposalId = defaultProposalId;
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
        res.body.should.have.property("createdBy").and.be.string;
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
