/* eslint-disable no-unused-vars */
"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");

var should = chai.should();
var utils = require("./LoginUtils");

var accessToken = null;
var accessTokenArchiveManager = null;
var boot = require("loopback-boot");

// TODO
// add tests for normal users (non functional accounts)
// add tests for jobs

var testdataset = {
  "owner": "Bertram Astor",
  "ownerEmail": "bertram.astor@grumble.com",
  "orcidOfOwner": "unknown",
  "contactEmail": "bertram.astor@grumble.com",
  "sourceFolder": "/iramjet/tif/",
  "creationTime": "2011-09-14T06:08:25.000Z",
  "keywords": [
    "Cryo", "Calibration"
  ],
  "description": "None",
  "license": "CC BY-SA 4.0",
  "isPublished": false,
  "ownerGroup": "p13388",
  "accessGroups": [],
  "type":"base"
};

var testraw = {
  "principalInvestigator": "bertram.astor@grumble.com",
  "endTime": "2011-09-14T06:31:25.000Z",
  "creationLocation": "/SU/XQX/RAMJET",
  "dataFormat": "Upchuck pre 2017",
  "scientificMetadata": {
    "beamlineParameters": {
      "Monostripe": "Ru/C",
      "Ring current": {
        "v": 0.402246,
        "u": "A"
      },
      "Beam energy": {
        "v": 22595,
        "u": "eV"
      }
    },
    "detectorParameters": {
      "Objective": 20,
      "Scintillator": "LAG 20um",
      "Exposure time": {
        "v": 0.4,
        "u": "s"
      }
    },
    "scanParameters": {
      "Number of projections": 1801,
      "Rot Y min position": {
        "v": 0,
        "u": "deg"
      },
      "Inner scan flag": 0,
      "File Prefix": "817b_B2_",
      "Sample In": {
        "v": 0,
        "u": "m"
      },
      "Sample folder": "/ramjet/817b_B2_",
      "Number of darks": 10,
      "Rot Y max position": {
        "v": 180,
        "u": "deg"
      },
      "Angular step": {
        "v": 0.1,
        "u": "deg"
      },
      "Number of flats": 120,
      "Sample Out": {
        "v": -0.005,
        "u": "m"
      },
      "Flat frequency": 0,
      "Number of inter-flats": 0
    }
  },
  "owner": "Bertram Astor",
  "ownerEmail": "bertram.astor@grumble.com",
  "orcidOfOwner": "unknown",
  "contactEmail": "bertram.astor@grumble.com",
  "sourceFolder": "/iramjet/tif/",
  "size": 0,
  "creationTime": "2011-09-14T06:08:25.000Z",
  "description": "None",
  "classification": "AV=medium,CO=low",
  "license": "CC BY-SA 4.0",
  "isPublished": false,
  "ownerGroup": "p13388",
  "accessGroups": [],
  "proposalId": "10.540.16635/20110123",
  "type":"raw"
};

var testderived = {
  "investigator": "egon.meier@web.de",
  "inputDatasets": [
    "/data/input/file1.dat"
  ],
  "usedSoftware": [
    "https://gitlab.psi.ch/ANALYSIS/csaxs/commit/7d5888bfffc440bb613bc7fa50adc0097853446c"
  ],
  "jobParameters": {
    "nscans": 10
  },
  "jobLogData": "Output of log file...",

  "owner": "Egon Meier",
  "ownerEmail": "egon.meier@web.de",
  "contactEmail": "egon.meier@web.de",
  "sourceFolder": "/data/example/2017",
  "creationTime": "2017-01-31T09:20:19.562Z",
  "keywords": [
    "Test", "Derived", "Science", "Math"
  ],
  "description": "Some fancy description",
  "isPublished": false,
  "ownerGroup": "p34123",
  "type":"derived"
};

var countDataset = 0;
var rawCountDataset = 0;
var derivedCountDataset = 0;
var pid = null;
var pidraw = null;
var pidderived = null;
var app;

// Make sure thet the boot code, which is executed via the require statement
// is finished before any test is run
// since there is no callback or this available I simply have to wait here
// This wait should be added to the first test running

before(function(done) {
  app = require("../server/server");
  console.log("Waiting for 5 seconds for boot tasks to finish: ",new Date());
  setTimeout(done,5000);
});

describe("Check different dataset types and their inheritance", () => {
  before((done) => {
    utils.getToken(app, {
      "username": "ingestor",
      "password": "aman"
    },
    (tokenVal) => {
      accessToken = tokenVal;
      utils.getToken(app, {
        "username": "archiveManager",
        "password": "aman"
      },
      (tokenVal) => {
        accessTokenArchiveManager = tokenVal;
        done();
      });

    });
  });

  // get counts

  it("should get count of datasets", function(done) {
    request(app)
      .get("/api/v3/Datasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        countDataset = res.body.count;
        done();
      });

  });

  it("should get count of raw datasets", function(done) {
    request(app)
      .get("/api/v3/RawDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        rawCountDataset = res.body.count;
        done();
      });

  });

  it("should get count of derived datasets", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        derivedCountDataset = res.body.count;
        done();
      });
  });

  // check if dataset is valid

  it("check if raw dataset is valid", function(done) {
    request(app)
      .post("/api/v3/RawDatasets/isValid")
      .send(testraw)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        //console.log(res.body)
        if (err)
          return done(err);
        res.body.should.have.property("valid").and.equal(true);
        done();
      });
  });

  it("check if wrong data is recognized as invalid", function(done) {
    request(app)
      .post("/api/v3/RawDatasets/isValid")
      .send(testderived)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        //console.log(res.body)
        if (err)
          return done(err);
        res.body.should.have.property("valid").and.equal(false);
        done();
      });
  });
  // add dataset and check what happened to counts

  it("adds a new dataset", function(done) {
    request(app)
      .post("/api/v3/Datasets?access_token=" + accessToken)
      .send(testdataset)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("version").and.be.string;
        res.body.should.have.property("type").and.equal("base");
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("createdBy").and.equal("ingestor");
        pid = encodeURIComponent(res.body["pid"]);
        done();
      });
  });

  // get counts again

  it("check for correct new count of datasets", function(done) {
    request(app)
      .get("/api/v3/Datasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDataset).should.equal(1);
        done();
      });
  });

  it("check for unchanged count of raw datasets", function(done) {
    request(app)
      .get("/api/v3/RawDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - rawCountDataset).should.equal(0);
        done();
      });
  });

  it("check for unchanged count of derived datasets", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - derivedCountDataset).should.equal(0);
        done();
      });
  });


  it("should add a new raw dataset", function(done) {
    request(app)
      .post("/api/v3/RawDatasets?access_token=" + accessToken)
      .send(testraw)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("version").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        pidraw = encodeURIComponent(res.body["pid"]);
        done();
      });
  });

  it("new dataset count should be incremented", function(done) {
    request(app)
      .get("/api/v3/Datasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDataset).should.equal(2);
        done();
      });
  });


  it("new raw dataset count should be incremented", function(done) {
    request(app)
      .get("/api/v3/RawDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - rawCountDataset).should.equal(1);
        done();
      });
  });

  it("new derived dataset count should be unchanged", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - derivedCountDataset).should.equal(0);
        done();
      });
  });



  it("adds a new derived dataset", function(done) {
    request(app)
      .post("/api/v3/DerivedDatasets?access_token=" + accessToken)
      .send(testderived)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("version").and.be.string;
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pidderived = encodeURIComponent(res.body["pid"]);
        done();
      });
  });


  it("new dataset count should be incremented", function(done) {
    request(app)
      .get("/api/v3/Datasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDataset).should.equal(3);
        done();
      });
  });

  it("new raw dataset count should be unchanged", function(done) {
    request(app)
      .get("/api/v3/RawDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - rawCountDataset).should.equal(1);
        done();
      });
  });

  it("new derived dataset count should be incremented", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - derivedCountDataset).should.equal(1);
        done();
      });
  });

  it("should delete the created new dataset", function(done) {
    request(app)
      .delete("/api/v3/Datasets/" + pid + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it("should delete the created new raw dataset", function(done) {
    request(app)
      .delete("/api/v3/Datasets/" + pidraw + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it("should delete the created new derived dataset", function(done) {
    request(app)
      .delete("/api/v3/Datasets/" + pidderived + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it("new dataset count should be back to old count", function(done) {
    request(app)
      .get("/api/v3/Datasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDataset).should.equal(0);
        done();
      });
  });

  it("new raw dataset count should be back to old count", function(done) {
    request(app)
      .get("/api/v3/RawDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - rawCountDataset).should.equal(0);
        done();
      });
  });

  it("new derived dataset count should be back to old count", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/count" + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - derivedCountDataset).should.equal(0);
        done();
      });
  });
});
