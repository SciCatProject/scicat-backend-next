/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessToken = null;
var accessTokenArchiveManager = null;
var pid = null;
var minPid = null;

describe("DerivedDataset: Derived Datasets", () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        utils.getToken(
          appUrl,
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
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("adds a new minimal derived dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        minPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("adds a new derived dataset", async () => {
    return request(appUrl)
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
    return request(appUrl)
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
    return request(appUrl)
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

    return request(appUrl)
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

  it("should fetch this derived dataset", async () => {
    const filter = {
      where: {
        pid: pid,
      },
    };

    return request(appUrl)
      .get(
        `/api/v3/datasets/findOne?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(pid);
      });
  });

  it("should fetch all derived datasets", async () => {
    const filter = {
      where: {
        type: "derived",
      },
    };

    return request(appUrl)
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

    return request(appUrl)
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
    return request(appUrl)
      .delete("/api/v3/Datasets/" + encodeURIComponent(pid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete a minimal derived dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + minPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
