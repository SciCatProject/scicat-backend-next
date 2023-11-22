/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const { Test } = require("mocha");
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessToken = null;
var accessTokenArchiveManager = null;
var accessTokenUser1 = null;
var accessTokenUser2 = null;
var pid = null;
var explicitPid = "B69A6239-5FD1-4244-8363-58C2DA1B6915";
var minPid = null;

describe("0700: DerivedDataset: Derived Datasets", () => {
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
            username: "user1",
            password: "a609316768619f154ef58db4d847b75e",
          },
          (tokenVal) => {
            accessTokenUser1 = tokenVal;
            utils.getToken(
              appUrl,
              {
                username: "user2",
                password: "f522d1d715970073a6413474ca0e0f63",
              },
              (tokenVal) => {
                accessTokenUser2 = tokenVal;
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
          },
        );
      },
    );
  });

  // check if dataset is valid
  it("0100: check if valid derived dataset is valid", async () => {
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

  it("0110: adds a new minimal derived dataset", async () => {
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

  it("0120: adds a new derived dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("owner")
          .and.be.equal(TestData.DerivedCorrect.owner);
        res.body.should.have.property("type").and.be.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pid = res.body["pid"];
      });
  });

  it("0130: should be able to add new derived dataset with explicit pid", async () => {
    const derivedDatasetWithExplicitPID = {
      ...TestData.DerivedCorrect,
      pid: "9b1bb7eb-5aae-4d86-8aff-9b034b60e1d8",
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(derivedDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("owner")
          .and.be.equal(derivedDatasetWithExplicitPID.owner);
        res.body.should.have.property("type").and.be.equal("derived");
        res.body.should.have
          .property("pid")
          .and.be.equal(derivedDatasetWithExplicitPID.pid);
        pid = res.body["pid"];
      });
  });

  it("0135: should not be able to add new derived dataset with user that is not in create dataset list", async () => {
    const derivedDatasetWithExplicitPID = {
      ...TestData.DerivedCorrect,
      pid: "fcab185e-4600-49ae-bcd5-41b2f9934d82",
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(derivedDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403)
      .expect("Content-Type", /json/);
  });

  it("0140: should not be able to add new derived dataset with group that is not part of allowed groups", async () => {
    const derivedDatasetWithExplicitPID = {
      ...TestData.DerivedCorrect,
      pid: "fcab185e-4600-49ae-bcd5-41b2f9934d82",
      ownerGroup: "group1",
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(derivedDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403)
      .expect("Content-Type", /json/);
  });

  it("0145: should not be able to add new derived dataset with correct group but explicit PID that does not pass validation", async () => {
    const derivedDatasetWithExplicitPID = {
      ...TestData.DerivedCorrect,
      ownerGroup: "group2",
      pid: "strange-pid",
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(derivedDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/);
  });

  it("0150: should be able to add new derived dataset with group that is part of allowed groups and correct explicit PID", async () => {
    const derivedDatasetWithExplicitPID = {
      ...TestData.DerivedCorrect,
      ownerGroup: "group2",
      pid: explicitPid,
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(derivedDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have
          .property("pid")
          .and.equal(derivedDatasetWithExplicitPID.pid);
        explicitPid = res.body["pid"];
      });
  });

  // check if dataset is valid
  it("0160: check if invalid derived dataset is valid", async () => {
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

  it("0170: tries to add an incomplete derived dataset", async () => {
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

  it("0180: should fetch several derived datasets", async () => {
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

  it("0190: should fetch this derived dataset", async () => {
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

  it("0200: should fetch all derived datasets", async () => {
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

  it("0210: should contain an array of facets", async () => {
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

  it("0220: should delete a derived dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + encodeURIComponent(pid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0230: should delete a minimal derived dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + minPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0240: should delete a derived dataset with explicit PID", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + explicitPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
