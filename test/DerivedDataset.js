"use strict";

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

chai.use(chaiHttp);

var accessToken = null;
var accessTokenArchiveManager = null;
var pid = null;

var testderived = {
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
  creationTime: "2017-01-31T09:20:19.562Z",
  keywords: ["Test", "Derived", "Science", "Math"],
  description: "Some fancy description",
  isPublished: false,
  ownerGroup: "p34123",
};

const app = "http://localhost:3000";

describe("DerivedDatasets", () => {
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

  it("adds a new derived dataset", async () => {
    return request(app)
      .post("/api/v3/DerivedDatasets")
      .send(testderived)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("should fetch one derived dataset", async () => {
    return request(app)
      .get("/api/v3/DerivedDatasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete a derived dataset", async () => {
    return request(app)
      .delete("/api/v3/DerivedDatasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should fetch all derived datasets", async () => {
    return request(app)
      .get(
        "/api/v3/DerivedDatasets?filter=%7B%22limit%22%3A2%7D&access_token=" +
          accessToken,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("should contain an array of facets", async () => {
    return request(app)
      .get("/api/v3/DerivedDatasets/fullfacet")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array");
      });
  });
});
