const { expect } = require("chai");
var chai = require("chai");
var should = chai.should();
var chaiHttp = require("chai-http");
const { plainToInstance } = require("class-transformer");
const { validate } = require("class-validator");
var request = require("supertest");
var utils = require("./LoginUtils");

//let CreateRawDatasetDto = import("../src/datasets/dto/create-raw-dataset.dto");

const { TestData } = require("./TestData");

chai.use(chaiHttp);

const app = "http://localhost:3000";

describe("Check different dataset types and their inheritance", () => {
/*   const testDatasetWrong = {
    owner: "Bertram Astor",
    ownerEmail: "bertram.astor@grumble.com",
    orcidOfOwner: "unknown",
    contactEmail: "bertram.astor@grumble.com",
    sourceFolder: "/iramjet/tif/",
    creationTime: "2011-09-14T06:08:25.000Z",
    keywords: ["Cryo", "Calibration"],
    description: "None",
    license: "CC BY-SA 4.0",
    isPublished: false,
    ownerGroup: "p13388",
    accessGroups: [],
    type: "base",
  };

  const testRawCorrect = {
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
    numberOfFiles: 0,
    creationTime: "2011-09-14T06:08:25.000Z",
    description: "None",
    datasetName: "Test raw dataset",
    classification: "AV=medium,CO=low",
    license: "CC BY-SA 4.0",
    isPublished: false,
    ownerGroup: "p13388",
    accessGroups: [],
    proposalId: "10.540.16635/20110123",
    type: "raw",
  };

  const testDerivedCorrect = {
    investigator: "egon.meier@web.de",
    inputDatasets: ["/data/input/file1.dat"],
    usedSoftware: [
      "https://gitlab.psi.ch/ANALYSIS/csaxs/commit/7d5888bfffc440bb613bc7fa50adc0097853446c",
    ],
    jobParameters: {
      nscans: 10,
    },
    jobLogData: "Output of log file...",

    owner: "Egon Meier",
    ownerEmail: "egon.meier@web.de",
    contactEmail: "egon.meier@web.de",
    sourceFolder: "/data/example/2017",
    size: 0,
    numberOfFiles: 0,
    creationTime: "2017-01-31T09:20:19.562Z",
    keywords: ["Test", "Derived", "Science", "Math"],
    description: "Some fancy description",
    datasetName: "Test derviced dataset",
    isPublished: false,
    ownerGroup: "p34123",
    accessGroups: [],
    type: "derived",
  };

  const testDerivedWrong = {
    investigator: "egon.meier@web.de",
    jobParameters: {
      nscans: 10,
    },
    jobLogData: "Output of log file...",
    owner: "Egon Meier",
    ownerEmail: "egon.meier@web.de",
    contactEmail: "egon.meier@web.de",
    sourceFolder: "/data/example/2017",
    creationTime: "2017-01-31T09:20:19.562Z",
    keywords: ["Test", "Derived", "Science", "Math"],
    description: "Some fancy description",
    isPublished: false,
    ownerGroup: "p34123",
    type: "derived",
  }; */

  let countDataset = 0;
  let countRawDataset = 0;
  let countDerivedDataset = 0;
  let pidRaw1 = null;
  let pidRaw2 = null;
  let pidDerived1 = null;
  let accessToken = null;
  let accessTokenArchiveManager = null;

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

  // get counts

  it("should get count of datasets", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.be.a("number");
        countDataset = res.body.count;
      });
  });

  it("should get count of raw datasets", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "raw" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.be.a("number");
        countRawDataset = res.body.count;
      });
    //.get("/api/v3/Datasets/count?where=" + encodeURIComponent("{\"type\":\"raw\"}"))
  });

  it("should get count of derived datasets", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "derived" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.be.a("number");
        countDerivedDataset = res.body.count;
      });
    //.get("/api/v3/Datasets/count?where=" + encodeURIComponent("{\"type\":\"raw\"}"))
  });

  // check if dataset is valid
  it("check if raw dataset is valid", async () => {
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

  it("check if derived dataset is valid", async () => {
    return request(app)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("check if wrong derived dataset is recognized as invalid", async () => {
    return request(app)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DerivedWrong)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("check if wrong typed dataset is recognized as invalid", async () => {
    return request(app)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DatasetWrong)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  // add dataset and check what happened to counts
  it("adds a new raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("__v").and.to.be.a("number");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have
          .property("ownerEmail")
          .and.equal(TestData.RawCorrect.ownerEmail);
        pidRaw1 = encodeURIComponent(res.body.pid);
      });
  });

  // get counts again
  it("check for correct new count of datasets", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countDataset).should.equal(1);
      });
  });

  it("check for count of raw datasets which should be 1", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "raw" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countRawDataset).should.equal(1);
      });
  });

  it("check for unchanged count of derived datasets", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "derived" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(0);
      });
  });

  it("should add a second raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("__v").and.to.be.a("number");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;

        pidRaw2 = encodeURIComponent(res.body.pid);
      });
  });

  it("new dataset count should be incremented", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countDataset).should.equal(2);
      });
  });

  it("new raw dataset count should be incremented", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "raw" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countRawDataset).should.equal(2);
      });
  });

  it("new derived dataset count should be unchanged", async () => {
    return request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "derived" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(0);
      });
  });

  it("adds a new derived dataset", async () => {
    request(app)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("__v").and.to.be.a("number");
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pidDerived1 = encodeURIComponent(res.body["pid"]);
      });
  });

  it("new dataset count should be incremented", function (done) {
    request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDataset).should.equal(3);
        done();
      });
  });

  it("new raw dataset count should be unchanged", function (done) {
    request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "raw" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countRawDataset).should.equal(2);
        done();
      });
  });

  it("new derived dataset count should be incremented", function (done) {
    request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "derived" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(1);
        done();
      });
  });

  it("should delete the first raw dataset", function (done) {
    request(app)
      .delete("/api/v3/Datasets/" + pidRaw1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should delete the second raw dataset", function (done) {
    request(app)
      .delete("/api/v3/Datasets/" + pidRaw2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should delete the derived dataset", function (done) {
    request(app)
      .delete("/api/v3/Datasets/" + pidDerived1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, _res) => {
        if (err) return done(err);
        done();
      });
  });

  it("new dataset count should be back to old count", function (done) {
    request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDataset).should.equal(0);
        done();
      });
  });

  it("new raw dataset count should be back to old count", function (done) {
    request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "raw" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countRawDataset).should.equal(0);
        done();
      });
  });

  it("new derived dataset count should be back to old count", function (done) {
    request(app)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ where: { type: "derived" } })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(0);
        done();
      });
  });
});
