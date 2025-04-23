/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const { v4: uuidv4 } = require("uuid");
const request = require("supertest");

const appUrl = "http://localhost:3000";

let accessTokenAdminIngestor = null;
let accessTokenUser1 = null;
let createdAttachmentId = null;

describe("Attachments v4 tests", () => {
  before(async () => {
    db.collection("Attachment").deleteMany({});

    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"].password,
    });
    accessTokenUser1 = await utils.getToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"].password,
    });
  });

  describe("Validation tests", () => {
    it("0100: should not be able to validate attachment if not logged in", async () => {
      return request(appUrl)
        .post("/api/v4/attachments/isValid")
        .send(TestData.AttachmentCorrectMinV4)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0105: check if minimal attachment is valid", async () => {
      return request(appUrl)
        .post("/api/v4/attachments/isValid")
        .send(TestData.AttachmentCorrectMinV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(true);
        });
    });

    it("0110: check if custom attachment is valid", async () => {
      return request(appUrl)
        .post("/api/v4/attachments/isValid")
        .send(TestData.AttachmentCorrectV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(true);
        });
    });

    it("0115: check if invalid attachment is valid", async () => {
      return request(appUrl)
        .post("/api/v4/attachments/isValid")
        .send(TestData.AttachmentWrongV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(false);
          res.body.should.have
            .property("reason")
            .and.have.length.greaterThan(0);
        });
    });
  });

  describe("Creation tests", () => {
    it("0200: should create a new attachment", async () => {
      const attachment = {
        ...TestData.AttachmentCorrectV4,
        aid: uuidv4(),
      };

      return request(appUrl)
        .post("/api/v4/attachments")
        .send(attachment)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("aid").and.be.a("string");
          createdAttachmentId = res.body.aid;
        });
    });
  });

  describe("Read tests", () => {
    it("0300: should fetch all attachments", async () => {
      return request(appUrl)
        .get("/api/v4/attachments")
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0305: should fetch attachment by id", async () => {
      return request(appUrl)
        .get(`/api/v4/attachments/${encodeURIComponent(createdAttachmentId)}`)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.aid.should.equal(createdAttachmentId);
        });
    });
  });

  describe("Update tests", () => {
    it("0400: should update attachment with PUT endpoint", async () => {
      const updatePayload = {
        ...TestData.AttachmentCorrectV4,
        caption: "Updated caption text updated",
      };

      return request(appUrl)
        .put(`/api/v4/attachments/${encodeURIComponent(createdAttachmentId)}`)
        .send(updatePayload)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.caption.should.equal(updatePayload.caption);
        });
    });

    it("0405: should update attachment partially with PATCH endpoint", async () => {
      const updatePayload = {
        caption: "Updated caption text",
        thumbnail: "Updated thumbnail URL",
        relationships: [
          {
            targetId: "testId1-modified",
            targetType: "dataset",
            relationType: "is attached to",
          },
          {
            targetId: "testId2-modified",
            targetType: "sample",
            relationType: "is attached to",
          },
        ],
      };

      return request(appUrl)
        .patch(`/api/v4/attachments/${encodeURIComponent(createdAttachmentId)}`)
        .send(updatePayload)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.caption.should.equal(updatePayload.caption);
          res.body.thumbnail.should.equal(updatePayload.thumbnail);
          res.body.relationships[0].targetId.should.equal(
            updatePayload.relationships[0].targetId,
          );
          res.body.relationships[1].targetId.should.equal(
            updatePayload.relationships[1].targetId,
          );
        });
    });
  });

  describe("Delete tests", () => {
    it("0500: should delete attachment", async () => {
      return request(appUrl)
        .delete(
          `/api/v4/attachments/${encodeURIComponent(createdAttachmentId)}`,
        )
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("aid");
        });
    });
  });
});
