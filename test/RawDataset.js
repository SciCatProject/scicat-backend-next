"use strict";

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

const { TestData } = require("./TestData");

chai.use(chaiHttp);

var accessToken = null;
var pid = null;
var accessProposalToken = null;
var accessTokenArchiveManager = null;

var proposalId = null;

const app = "http://localhost:3000";

describe("RawDataset: Raw Datasets", () => {
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
            username: "proposalIngestor",
            password: "aman",
          },
          (tokenVal) => {
            accessProposalToken = tokenVal;
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
      },
    );
  });

  it("adds a new proposal", async () => {
    return request(app)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectComplete)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessProposalToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        proposalId = encodeURIComponent(res.body["proposalId"]);
      });
  });

  // check if dataset is valid
  it("check if valid raw dataset is valid", async () => {
    return request(app)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("adds a new raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        pid = res.body["pid"];
      });
  });

  // check if dataset is valid
  it("check if invalid raw dataset is valid", async () => {
    return request(app)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawWrong_1)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("tries to add an incomplete raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.RawWrong_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("tries to add a raw dataset with history field", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.RawWrong_2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
        console.log(res.statusCode);
      });
  });

  it("should fetch several raw datasets", async () => {
    const filter = {
      where: {
        type: "raw",
      },
      limit: 2,
    };

    return (
      request(app)
        // eslint-disable-next-line prettier/prettier
        .get(`/api/v3/Datasets?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .query(JSON.stringify(filter))
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.instanceof(Array);
        })
    );
  });

  it("should fetch this raw dataset", async () => {
    const filter = {
      where: {
        pid: pid,
      },
    };

    return (
      request(app)
        // eslint-disable-next-line prettier/prettier
        .get(`/api/v3/Datasets/findOne?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("pid").and.equal(pid);
        })
    );
  });

  it("should contain an array of facets", async () => {
    const filter = {
      ownerGroup: ["p11114"],
    };

    return (
      request(app)
        // eslint-disable-next-line prettier/prettier
        .get(`/api/v3/datasets/fullfacet?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array");
        })
    );
  });

  it("should delete this raw dataset", async () => {
    return request(app)
      .delete("/api/v3/datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this proposal", async () => {
    return request(app)
      .delete("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessProposalToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
