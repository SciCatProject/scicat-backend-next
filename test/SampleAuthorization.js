/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenSamplesIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  sampleId1 = null,
  sampleId2 = null,
  sampleId3 = null,
  sampleId4 = null,
  sampleId5 = null,
  attachementId1 = null,
  attachementId2 = null,
  attachementId3 = null,
  attachementId4 = null,
  attachementId5 = null
  
describe("2200: Sample: Sample Authorization", () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "adminIngestor",
        password: TestData.Accounts["adminIngestor"]["password"],
      },
      (tokenVal) => {
        accessTokenAdminIngestor = tokenVal;
        utils.getToken(
          appUrl,
          {
            username: "sampleIngestor",
            password: TestData.Accounts["sampleIngestor"]["password"],
          },
          (tokenVal) => {
            accessTokenSampleIngestor = tokenVal;
            utils.getToken(
              appUrl,
              {
                username: "user1",
                password: TestData.Accounts["user1"]["password"],
              },
              (tokenVal) => {
                accessTokenUser1 = tokenVal;
                utils.getToken(
                  appUrl,
                  {
                    username: "user2",
                    password: TestData.Accounts["user2"]["password"],
                  },
                  (tokenVal) => {
                    accessTokenUser2 = tokenVal;
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

  it("0010: adds a new sample as Admin Ingestor with owner group its own group", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId1 = res.body["sampleId"];
      });
  });

  it("0020: adds a new sample as Admin Ingestor with owner group sampleingestor", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId2 = res.body["sampleId"];
      });
  });

  it("0030: adds a new sample as Admin Ingestor with owner group as group1", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId3 = res.body["sampleId"];
      });
  });

  it("0040: adds a new sample as Admin Ingestor with owner group as group2", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId4 = res.body["sampleId"];
      });
  });


  it("0050: adds a new sample as Sample Ingestor with owner group as adminingestor", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId5 = res.body["sampleId"];
      });
  });

  it("0060: adds a new sample as Sample Ingestor with its owner group", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId6 = res.body["sampleId"];
      });
  });

  it("0070: adds a new sample as Sample Ingestor with owner group as group1", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId7 = res.body["sampleId"];
      });
  });

  it("0080: adds a new sample as Sample Ingestor with owner group as group2", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId8 = res.body["sampleId"];
      });
  });

  it("0090: adds a new sample as User1 with owner group as adminingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(403);
  });

  it("0100: adds a new sample as User1 with owner group as sampleingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(403);
  });

  it("0110: adds a new sample as User1 with its owner group", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        sampleId9 = res.body["sampleId"];
      });
  });

  it("0120: adds a new sample as User1 with owner group as group2, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(403);
  });

  it("0130: adds a new sample as User1 with owner group as adminingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(403);
  });

  it("0140: adds a new sample as User2 with owner group as sampleingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(403);
  });

  it("0150: adds a new sample as User2 with owner group as user1, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(403);
  });

  it("0160: adds a new sample as User2 with its owner group, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(403);
  });


  

  it("0020: should fetch this new sample", async () => {
    return request(appUrl)
      .get("/api/v3/Samples/" + sampleId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
      });
  });

  it("0030: should add a new attachment to this sample", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("thumbnail")
          .and.equal(TestData.AttachmentCorrect.thumbnail);
        res.body.should.have
          .property("caption")
          .and.equal(TestData.AttachmentCorrect.caption);
        res.body.should.have
          .property("ownerGroup")
          .and.equal(TestData.AttachmentCorrect.ownerGroup);
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId = res.body["id"];
      });
  });

  it("0040: should fetch all attachments of this sample", async () => {
    return request(appUrl)
      .get("/api/v3/Samples/" + sampleId + "/attachments/")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  // NOTE: Not sure if this one is still needed because this endpoint is not present in the swagger documentation. We are not able to fetch specific attachment under samples.
  it("0050: should fetch this sample attachment", async () => {
    return request(appUrl)
      .get("/api/v3/Samples/" + sampleId + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0060: should delete this sample attachment", async () => {
    return request(appUrl)
      .delete("/api/v3/Samples/" + sampleId + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200);
  });

  it("0070: should return no datasets", async () => {
    return request(appUrl)
      .get("/api/v3/Samples/" + sampleId + "/datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.equal(0);
      });
  });

  it("0080: insert dataset using this sample", async () => {
    let dataset = { ...TestData.RawCorrect };
    dataset.sampleId = sampleId;
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        datasetId = encodeURIComponent(res.body["pid"]);
      });
  });

  it("0090: should retrieve dataset for sample", async () => {
    return request(appUrl)
      .get("/api/v3/Samples/" + sampleId + "/datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.equal(1);
        res.body[0].pid.should.be.equal(decodeURIComponent(datasetId));
      });
  });

  it("0100: should delete the dataset linked to sample", function (done) {
    request(appUrl)
      .delete("/api/v3/Datasets/" + datasetId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  it("0110: should delete this sample", async () => {
    return request(appUrl)
      .delete("/api/v3/Samples/" + sampleId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
