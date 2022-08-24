"use strict";

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

chai.use(chaiHttp);

var accessTokenIngestor = null;
var accessTokenArchiveManager = null;

var pid = null;
var pidraw = null;
var pid2 = null;
var pidraw2 = null;

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
  creationTime: "2011-09-14T06:08:25.000Z",
  description: "The ultimate test",
  isPublished: false,
  ownerGroup: "p10029",
  accessGroups: [],
  proposalId: "10.540.16635/20110123",
  keywords: ["sls", "protein"],
  type: "raw",
};

const app = "http://localhost:3000";

describe("Test facet and filter queries", () => {
  beforeEach((done) => {
    utils.getToken(
      app,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessTokenIngestor = tokenVal;
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

  it("adds a new raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(testraw)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        pidraw = res.body["pid"];
      });
  });

  it("adds another new raw dataset", async () => {
    // modify owner
    testraw.ownerGroup = "p12345";
    return request(app)
      .post("/api/v3/Datasets")
      .send(testraw)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        pidraw2 = res.body["pid"];
      });
  });

  // TODO add test for derived dataset queries as well

  it("Should return datasets with complex join query fulfilled", async () => {
    var fields = {
      ownerGroup: ["p12345", "p10029"],
      text: '"ultimate test"',
      creationTime: {
        begin: "2011-09-13",
        end: "2011-09-15",
      },
      "datasetlifecycle.archiveStatusMessage": "datasetCreated",
      keywords: ["energy", "protein"],
    };

    return request(app)
      .get(
        "/api/v3/Datasets/fullquery?fields=" +
          encodeURIComponent(JSON.stringify(fields)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.is.not.empty;
        res.body[0]["datasetlifecycle"].should.have
          .property("archiveStatusMessage")
          .and.equal("datasetCreated");
      });
  });

  it("Should return datasets with ordered results", async () => {
    var fields = {
      ownerGroup: ["p12345", "p10029"],
    };
    var limits = {
      order: "creationTime:desc",
      skip: 0,
    };

    return request(app)
      .get(
        "/api/v3/RawDatasets/fullquery?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("Should return no datasets, because number of hits exhausted", async () => {
    var fields = {
      ownerGroup: ["p12345"],
      "datasetlifecycle.archiveStatusMessage": "datasetCreated",
    };
    var limits = {
      skip: 1000,
    };

    return request(app)
      .get(
        "/api/v3/Datasets/fullquery?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.is.empty;
      });
  });

  it("Should return facets with complex join query fulfilled", async () => {
    var fields = {
      ownerGroup: ["p12345", "p10029"],
      text: '"ultimate test"',
      creationTime: {
        begin: "2011-09-13",
        end: "2011-09-15",
      },
      keywords: ["energy", "protein"],
    };
    var facets = [
      "type",
      "creationTime",
      "creationLocation",
      "ownerGroup",
      "keywords",
    ];
    return request(app)
      .get(
        "/api/v3/Datasets/fullfacet?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&facets=" +
          encodeURIComponent(JSON.stringify(facets)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  // Note: make the tests with PUT instead of patch as long as replaceOnPut false
  it("Should update archive status message from archiveManager account", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid)
      .send({
        datasetlifecycle: {
          archiveStatusMessage: "dataArchivedOnTape",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.archiveStatusMessage")
          .and.equal("dataArchivedOnTape");
      });
  });

  it("Should update the datasetLifecycle information for multiple datasets", async () => {
    var filter = {
      pid: {
        inq: [pidraw, pidraw2],
      },
    };
    return request(app)
      .put("/api/v3/Datasets/where=" + JSON.stringify(filter))
      .send({
        datasetlifecycle: {
          archiveStatusMessage: "justAnotherTestMessage",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.equal(2);
      });
  });

  it("The history status should now include the last change for the first raw dataset", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property(
            "history[1].datasetlifecycle.previousValue.archiveStatusMessage",
          )
          .and.equal("dataArchivedOnTape");
        res.body.should.have.nested
          .property(
            "history[1].datasetlifecycle.currentValue.archiveStatusMessage",
          )
          .and.equal("justAnotherTestMessage");
      });
  });

  it("The history status should now include the last change for second raw dataset", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property(
            "history[0].datasetlifecycle.previousValue.archiveStatusMessage",
          )
          .and.equal("datasetCreated");
        res.body.should.have.nested
          .property(
            "history[0].datasetlifecycle.currentValue.archiveStatusMessage",
          )
          .and.equal("justAnotherTestMessage");
      });
  });

  it("Should update the datasetLifecycle information directly via embedded model API", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid + "/datasetLifecycle")
      .send({
        archiveStatusMessage: "Testing embedded case",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("archiveStatusMessage")
          .and.equal("Testing embedded case");
      });
  });

  it("Should reset the embedded DatasetLifecycle status and delete Datablocks", async () => {
    return request(app)
      .put("/api/v3/Datasets/resetArchiveStatus")
      .send({
        datasetId: pidraw,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete the newly created dataset", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("should delete the newly created dataset", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });
});
