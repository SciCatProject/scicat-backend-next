"use strict";

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

chai.use(chaiHttp);

const { TestData } = require("./TestData");

var accessToken = null;
var accessTokenArchiveManager = null;
var pid = null;

const app = "http://localhost:3000";

describe("DerivedDataset: Derived Datasets", () => {
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

  // check if dataset is valid
  it("check if valid derived dataset is valid", async () => {
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

  it("adds a new derived dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pid = res.body["pid"];
      });
  });

  // check if dataset is valid
  it("check if invalid derived dataset is valid", async () => {
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

  it("tries to add an incomplete derived dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedWrong)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("should fetch several derived datasets", async () => {
    const filter = {
      where: {
        type: "derived",
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

  it("should fetch this derived dataset", async () => {
    const filter = {
      where: {
        pid: pid,
      },
    };

    return (
      request(app)
        // eslint-disable-next-line prettier/prettier
        .get(`/api/v3/datasets/findOne?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .then((res) => {
          res.body.should.have.property("pid").and.equal(pid);
        })
    );
  });

  it("should fetch all derived datasets", async () => {
    const filter = {
      where: {
        type: "derived",
      },
    };

    return request(app)
      .get(
        "/api/v3/Datasets?filter=" + encodeURIComponent(JSON.stringify(filter)),
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
    const filter = {
      where: {
        type: "derived",
      },
    };

    return request(app)
      .get(
        "/api/v3/Datasets?filter=" + encodeURIComponent(JSON.stringify(filter)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array");
      });
  });

  it("should delete a derived dataset", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
