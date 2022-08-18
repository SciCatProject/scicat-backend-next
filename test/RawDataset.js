"use strict";

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

chai.use(chaiHttp);

var accessToken = null;
var pid = null;
var accessProposalToken = null;
var accessTokenArchiveManager = null;

var testproposal = {
  proposalId: "someprefix/20170266",
  email: "proposer%40uni.edu",
  title: "A test proposal",
  abstract: "Abstract of test proposal",
  ownerGroup: "p10029",
  MeasurementPeriodList: [],
};

var testraw = {
  principalInvestigator: "bertram.astor@grumble.com",
  endTime: "2011-09-14T06:31:25.000Z",
  creationLocation: "/SU/XQX/RAMJET",
  dataFormat: "Upchuck pre 2017",
  scientificMetadata: {
    beamlineParameters: {
      Monostripe: "Ru/C",
      "Ring current": {
        v: 0.402246,
        u: "A",
      },
      "Beam energy": {
        v: 22595,
        u: "eV",
      },
    },
    detectorParameters: {
      Objective: 20,
      Scintillator: "LAG 20um",
      "Exposure time": {
        v: 0.4,
        u: "s",
      },
    },
    scanParameters: {
      "Number of projections": 1801,
      "Rot Y min position": {
        v: 0,
        u: "deg",
      },
      "Inner scan flag": 0,
      "File Prefix": "817b_B2_",
      "Sample In": {
        v: 0,
        u: "m",
      },
      "Sample folder": "/ramjet/817b_B2_",
      "Number of darks": 10,
      "Rot Y max position": {
        v: 180,
        u: "deg",
      },
      "Angular step": {
        v: 0.1,
        u: "deg",
      },
      "Number of flats": 120,
      "Sample Out": {
        v: -0.005,
        u: "m",
      },
      "Flat frequency": 0,
      "Number of inter-flats": 0,
    },
  },
  owner: "Bertram Astor",
  ownerEmail: "bertram.astor@grumble.com",
  orcidOfOwner: "unknown",
  contactEmail: "bertram.astor@grumble.com",
  sourceFolder: "/iramjet/tif/",
  size: 0,
  type: "raw",
  creationTime: "2011-09-14T06:08:25.000Z",
  description: "None",
  isPublished: false,
  ownerGroup: "p10029",
  accessGroups: [],
};

var proposalId = null;

const app = "http://localhost:3000";

describe("RawDatasets", () => {
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
      .send(testproposal)
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

  it("adds a new raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(testraw)
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

  it("should fetch several raw datasets", async () => {
    const filter = {
      where: {
        type: "raw",
      },
      limit: 2,
    };

    return request(app)
      .get(
        `/api/v3/Datasets?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .query(JSON.stringify(filter))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("should fetch this raw dataset", async () => {
    const filter = {
      where: {
        pid: pid,
      },
    };

    return request(app)
      .get(
        `/api/v3/Datasets/findOne?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(pid);
      });
  });

  it("should delete this raw dataset", async () => {
    return request(app)
      .delete("/api/v3/datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should contain an array of facets", async () => {
    const filter = {
      ownerGroup: ["p11114"],
    };

    return request(app)
      .get(
        `/api/v3/datasets/fullfacet?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array");
      });
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
