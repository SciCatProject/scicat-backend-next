/* eslint-disable @typescript-eslint/no-var-requires */
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

describe("0200: CheckDifferentDatasetTypes: Check different dataset types and their inheritance", () => {
  let countDataset = 0;
  let countRawDataset = 0;
  let countDerivedDataset = 0;
  let pidRaw1 = null;
  let pidRaw2 = null;
  let pidDerived1 = null;
  let accessToken = null;
  let accessTokenArchiveManager = null;
  let policyIds = [];

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

  // get counts

  it("0010: should get count of datasets", async () => {
    return request(appUrl)
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

  it("0020: should get count of raw datasets", async () => {
    return request(appUrl)
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
  });

  it("0030: should get count of derived datasets", async () => {
    return request(appUrl)
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
  });

  // check if dataset is valid
  it("0040: check if raw dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("0050: check if derived dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("0060: check if wrong derived dataset is recognized as invalid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DerivedWrong)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("0070: check if wrong typed dataset is recognized as invalid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.DatasetWrong)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  // add dataset and check what happened to counts
  it("0080: adds a new raw dataset", function (done) {
    request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("__v").and.to.be.a("number");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have
          .property("ownerEmail")
          .and.equal(TestData.RawCorrect.ownerEmail);
        pidRaw1 = encodeURIComponent(res.body.pid);
        done();
      });
  });

  // get counts again
  it("0090: check for correct new count of datasets", async () => {
    return request(appUrl)
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

  it("0100: check for count of raw datasets which should be 1", async () => {
    const filter = { where: { type: "raw" } };

    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countRawDataset).should.equal(1);
      });
  });

  it("0110: check for unchanged count of derived datasets", async () => {
    const filter = { where: { type: "derived" } };
    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(0);
      });
  });

  it("0120: should add a second raw dataset", async () => {
    return request(appUrl)
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

  it("0130: new dataset count should be incremented", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countRawDataset).should.equal(2);
      });
  });

  it("0140: new raw dataset count should be incremented", function (done) {
    const filter = { where: { type: "raw" } };

    request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countRawDataset).should.equal(2);
        done();
      });
  });

  it("0150: new derived dataset count should be unchanged", async () => {
    const filter = { where: { type: "derived" } };

    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("count").and.to.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(0);
      });
  });

  it("0160: adds a new derived dataset", function (done) {
    request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("__v").and.to.be.a("number");
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pidDerived1 = encodeURIComponent(res.body["pid"]);
        done();
      });
  });

  it("0170: new dataset count should be incremented", function (done) {
    request(appUrl)
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

  it("0180: new raw dataset count should be unchanged", function (done) {
    const filter = { where: { type: "raw" } };

    request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countRawDataset).should.equal(2);
        done();
      });
  });

  it("0190: new derived dataset count should be incremented", function (done) {
    const filter = { where: { type: "derived" } };

    request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.have.property("count").and.be.a("number");
        (res.body.count - countDerivedDataset).should.equal(1);
        done();
      });
  });

  it("0200: should delete the first raw dataset", function (done) {
    request(appUrl)
      .delete("/api/v3/Datasets/" + pidRaw1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  it("0210: should delete the second raw dataset", function (done) {
    request(appUrl)
      .delete("/api/v3/Datasets/" + pidRaw2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  it("0220: should delete the derived dataset", function (done) {
    request(appUrl)
      .delete("/api/v3/Datasets/" + pidDerived1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  it("0230: heck for the default policies to have been created", async () => {
    // Query only newly created ones by the tests. This way we prevent removing all the policies that exist before the tests were run.
    const start = new Date();
    start.setHours(start.getHours(), 0, 0, 0);
    const filter = { where: { createdAt: { $gte: start } } };

    return request(appUrl)
      .get(
        `/api/v3/Policies?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        policyIds = res.body.map((x) => x["_id"]);
      });
  });

  it("0240: should delete the default policies created with datasets", async () => {
    for (const item of policyIds) {
      await request(appUrl)
        .delete("/api/v3/policies/" + item)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
        .expect(200);
    }
  });

  it("0250: new dataset count should be back to old count", function (done) {
    request(appUrl)
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

  it("0260: new raw dataset count should be back to old count", function (done) {
    request(appUrl)
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

  it("0270: new derived dataset count should be back to old count", function (done) {
    request(appUrl)
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
