/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenProposalIngestor = null,
  accessTokenAdminIngestor = null,
  accessTokenArchiveManager = null,
  defaultProposalId = null,
  proposalId = null,
  attachmentId = null;

describe("1500: Proposal: Simple Proposal", () => {
  before(() => {
    db.collection("Proposal").deleteMany({});
  });
  beforeEach(async() => {
    accessTokenProposalIngestor = await utils.getToken(appUrl, {
      username: "proposalIngestor",
      password: TestData.Accounts["proposalIngestor"]["password"],
    });

    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
  });

  // the following two function definition prepare for
  // multi-delete actions to finish
  async function deleteProposal(item) {
    const response = await request(appUrl)
      .delete("/api/v3/Proposals/" + item.proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode);

    return response;
  }

  async function processArray(array) {
    for (const item of array) {
      await deleteProposal(item);
    }
  }

  it("0010: remove potentially existing proposals to guarantee uniqueness", async () => {
    return request(appUrl)
      .get("/api/v3/Proposals")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        // now remove all these entries
        processArray(res.body);
      });
  });

  // check if proposal is valid
  it("0020: check if minimal proposal is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals/isValid")
      .send(TestData.ProposalCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("0030: adds a new proposal with minimal data", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        defaultProposalId = res.body["proposalId"];
        proposalId = encodeURIComponent(res.body["proposalId"]);
      });
  });

  it("0040: cannot add new proposal with same proposal id", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.ConflictStatusCode);
  });

  // check if proposal is valid
  it("0050: check if complete proposal is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals/isValid")
      .send(TestData.ProposalCorrectComplete)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("0060: adds a new proposal with complete data", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectComplete)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        defaultProposalId = res.body["proposalId"];
        proposalId = encodeURIComponent(res.body["proposalId"]);
      });
  });

  // check if proposal with additional field is valid
  it("0070: check if complete proposal with extra field is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals/isValid")
      .send(TestData.ProposalWrong_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("0080: adds a new complete proposal with an extra field, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalWrong_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.equal(200);
      });
  });

  it("0090: should fetch this new proposal", async () => {
    return request(appUrl)
      .get("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("createdBy").and.be.string;
        res.body.should.have.property("updatedBy").and.be.string;
      });
  });

  it("0100: should add a new attachment to this proposal", async () => {
    let testAttachment = { ...TestData.AttachmentCorrect };
    testAttachment.proposalId = defaultProposalId;
    return request(appUrl)
      .post("/api/v3/Proposals/" + proposalId + "/attachments")
      .send(testAttachment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
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

  it("0110: should fetch this proposal attachment", async () => {
    return request(appUrl)
      .get("/api/v3/Proposals/" + proposalId + "/attachments")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body[res.body.length - 1].id.should.be.equal(attachmentId);
      });
  });

  it("0120: should delete this proposal attachment", async () => {
    return request(appUrl)
      .delete(
        "/api/v3/Proposals/" + proposalId + "/attachments/" + attachmentId,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenProposalIngestor}` })
      .expect(TestData.SuccessfulDeleteStatusCode);
  });

  it("0130: admin can remove all existing proposals", async () => {
    return await request(appUrl)
      .get("/api/v3/Proposals")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        return processArray(res.body);
      });
  });
});
