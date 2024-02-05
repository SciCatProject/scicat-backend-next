/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenSampleIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  accessTokenUser3 = null,
  accessTokenUser4 = null,
  accessTokenUser5 = null,
  accessTokenArchiveManager = null,
  sampleId1 = null,
  sampleId2 = null,
  sampleId3 = null,
  sampleId4 = null,
  sampleId5 = null,
  sampleId6 = null,
  sampleId7 = null,
  sampleId8 = null,
  sampleId9 = null,
  sampleId10 = null,
  attachmentId1 = null,
  attachmentId2 = null,
  attachmentId3 = null,
  attachmentId4 = null,
  attachmentId5 = null,
  attachmentId6 = null,
  attachmentId7 = null,
  attachmentId8 = null,
  attachmentId9 = null

  
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
                    utils.getToken(
                      appUrl,
                      {
                        username: "archiveManager",
                        password: TestData.Accounts["archiveManager"]["password"],
                      },
                      (tokenVal) => {
                        accessTokenArchiveManager = tokenVal;
                        utils.getToken(
                          appUrl,
                          {
                            username: "user3",
                            password: TestData.Accounts["user3"]["password"],
                          },
                          (tokenVal) => {
                            accessTokenUser3 = tokenVal;
                            utils.getToken(
                              appUrl,
                              {
                                username: "user4",
                                password: TestData.Accounts["user4"]["password"],
                              },
                              (tokenVal) => {
                                accessTokenUser4 = tokenVal;
                                utils.getToken(
                                  appUrl,
                                  {
                                    username: "user5_1",
                                    password: TestData.Accounts["user5_1"]["password"],
                                  },
                                  (tokenVal) => {
                                    accessTokenUser5 = tokenVal;
                                    done();
                                  },
                                );
                              },
                            );
                          },
                        );
                      },
                    );
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
    sample.accessGroups=["group5"];

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have
          .property("ownerGroup")
          .and.equal("adminingestor");
        res.body.should.have.property("sampleId").and.be.string;
        sampleId1 = res.body["sampleId"];
      });
  });

  it("0020: adds a new sample as Admin Ingestor with owner group sampleingestor", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";
    sample.accessGroups=["group3"];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("sampleingestor");
        sampleId2 = res.body["sampleId"];
      });
  });

  it("0030: adds a new sample as Admin Ingestor with owner group as group1", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";
    sample.accessGroups=["group1","group3"];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("group1");
        sampleId3 = res.body["sampleId"];
      });
  });

  it("0040: adds a new sample as Admin Ingestor with owner group as group2", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";
    sample.accessGroups=["group2","group4"];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("group2");
        sampleId4 = res.body["sampleId"];
      });
  });

  it("0045: adds a new public sample as Admin Ingestor with owner group as nogroup", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "nogroup";
    sample.accessGroups=[];
    sample.isPublished=True;

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        res.body.should.have
          .property("ownerGroup")
          .and.equal("group1");
        sampleId10 = res.body["sampleId"];
      });
  });


  it("0050: adds a new sample as Sample Ingestor with owner group as adminingestor", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";
    sample.accessGroups=["group5","group2"];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("adminingestor");
        sampleId5 = res.body["sampleId"];
      });
  });

  it("0060: adds a new sample as Sample Ingestor with its owner group", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";
    sample.accessGroups=["group1","group4"];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("sampleingestor");
        sampleId6 = res.body["sampleId"];
      });
  });

  it("0070: adds a new sample as Sample Ingestor with owner group as group1", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";
    sample.accessGroups=["group2","group3"];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("group1");
        sampleId7 = res.body["sampleId"];
      });
  });

  it("0080: adds a new sample as Sample Ingestor with owner group as group2", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";
    sample.accessGroups=[];

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
        res.body.should.have
          .property("ownerGroup")
          .and.equal("group2");
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
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
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
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0110: adds a new sample as User1 with its owner group", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";
    sample.accessGroups=["group5"];

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        res.body.should.have
          .property("ownerGroup")
          .and.equal("group1");
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
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
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
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
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
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
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
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
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
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403);
  });

  it("0170: adds a new sample as an unauthenticated user with owner group as adminingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0180: adds a new sample as an unauthenticated user with owner group as sampleingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0190: adds a new sample as an unauthenticated user with owner group as user1, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0200: adds a new sample as an unauthenticated user with its owner group, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0210: adds a new sample as Archive Manager with owner group as adminingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "adminingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0220: adds a new sample as Archive Manager with owner group as sampleingestor, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "sampleingestor";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0230: adds a new sample as Archive Manager with owner group as user1, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group1";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0240: adds a new sample as Archive Manager with its owner group, which should fail", async () => {
    let sample = {
      ...TestData.SampleCorrect,
    };
    sample.ownerGroup = "group2";

    return request(appUrl)
      .post("/api/v3/Samples")
      .send(sample)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });
  
  it("0250: adds an attachment as Admin Ingestor to a sample owned by its own group", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId2 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
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
          .and.equal("adminingestor");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId1 = res.body["id"];
      });
  });

  it("0260: adds a new attachment as Admin Ingestor to a sample with owner group sampleingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId2 + "/attachment")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
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
          .and.equal("sampleingestor");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId2 = res.body["id"];
      });
  });

  it("0270: adds an attachment as Admin Ingestor to a sample with owner group as group1", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId3 + "/attachment")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
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
          .and.equal("group1");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId3 = res.body["id"];
      });
  });

  it("0280: adds an attachement as Admin Ingestor to a sample with owner group as group2", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId4 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
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
          .and.equal("group2");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId4 = res.body["id"];
      });
  });

  it("0290: adds an attachment as Sample Ingestor to a sample with owner group as adminingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId5 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
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
          .and.equal("adminingestor");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId5 = res.body["id"];
      });
  });

  it("0300: adds an attachment as Sample Ingestor to a sample owned by its group", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId6 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
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
          .and.equal("sampleingestor");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId6 = res.body["id"];
      });
  });

  it("0310: adds an attachement as Sample Ingestor to a sample with owner group as group1", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId7 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
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
          .and.equal("group1");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId7 = res.body["id"];
      });
  });

  it("0320: adds an attachement as Sample Ingestor to a sample with owner group as group2", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId8 + "/attachment")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
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
          .and.equal("group2");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId8 = res.body["id"];
      });
  });

  it("0330: adds an attachment as User1 to a sample with owner group as adminingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId1 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0340: adds an attachment as User1 to a sample with owner group as sampleingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId2 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0350: adds an attachment as User1 to a sample with its owner group", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId9 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
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
          .and.equal("group1");
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId9 = res.body["id"];
      });
  });

  it("0360: adds an attachment as User1 to a sample with owner group as group2, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId4 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0370: adds an attachment as User2 to a sample with owner group as adminingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId1 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403);
  });

  it("0380: adds an attachement as User2 to a sample with owner group as sampleingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId2 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403);
  });

  it("0390: adds an attachement as User2 to a sample with owner group as user1, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId3 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403);
  });

  it("0400: adds an attachement as User2 to a sample with its owner group, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId4 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403);
  });

  it("0410: adds an attachment as an unauthenticated user to a sample with owner group as adminingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId1 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0420: adds an attachment as an unauthenticated user to a sample with owner group as sampleingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId2 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0430: adds an attachement as an unauthenticated user to a sample with owner group as user1, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId3 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0440: adds an attachment as an unauthenticated user to a sample with its owner group, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId4 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .expect(403);
  });

  it("0450: adds an attachment as Archive Manager to a sample with owner group as adminingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId1 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0460: adds an attachment as Archive Manager to a sample with owner group as sampleingestor, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId2 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0470: adds an attachment as Archive Manager to a sample with owner group as user1, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId3 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0480: adds an attachment as Archive Manager to a sample with its owner group, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Samples/" + sampleId4 + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403);
  });

  it("0490: fetch all samples as Admin Ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(10);
      });
  });

  it("0500: fetch all samples with owner group as adminingestor as Admin Ingestor", async () => {
    const filter = {
      where: {
        ownerGroup: "adminingestor",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(2);
        res.body.should.have.property("sampleId").and.have.members([sampleId1, sampleId5]);
      });
  });

  it("0510: fetch all samples with owner group as group1 as Admin Ingestor", async () => {
    const filter = {
      where: {
        ownerGroup: "group1",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(3);
        res.body.should.have.property("sampleId").and.have.members([sampleId3, sampleId7, sampleId9]);
      });
  });

  it("0520: fetch all samples as Sample Ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(3);
      });
  });

  it("0530: fetch all samples with owner group as sampleingestor as Sample Ingestor", async () => {
    const filter = {
      where: {
        ownerGroup: "sampleingestor",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenSampleIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(2);
        res.body.should.have.property("sampleId").and.have.members([sampleId2, sampleId6]);
      });
  });

  it("0540: fetch all samples with owner group as group1 as Sample Ingestor", async () => {
    const filter = {
      where: {
        ownerGroup: "group1",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(0);
      });
  });

  it("0550: fetch all samples as User 1 (Group 1)", async () => {
    return request(appUrl)
      .get("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(6);
      });
  });

  it("0560: fetch all samples with owner group as group1 as User 1", async () => {
    const filter = {
      where: {
        ownerGroup: "group1",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(3);
        res.body.should.have.property("sampleId").and.have.members([sampleId3, sampleId7, sampleId9]);
      });
  });

  it("0560: fetch all samples with owner group as group2 as User 1", async () => {
    const filter = {
      where: {
        ownerGroup: "group2",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(0);
      });
  });

  it("0570: fetch all samples as User 2 (Group 2)", async () => {
    return request(appUrl)
      .g3t("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(6);
      });
  });

  it("0580: fetch all samples with owner group as group2 as User 2", async () => {
    const filter = {
      where: {
        ownerGroup: "group2",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(2);
        res.body.should.have.property("sampleId").and.have.members([sampleId4, sampleId8]);
      });
  });

  it("0590: fetch all samples with owner group as nogroup as User 2", async () => {
    const filter = {
      where: {
        ownerGroup: "nogroup",
      }
    };

    return request(appUrl)
      .get(
        `/api/v3/Samples?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(1);
        res.body.should.have.property("sampleId").and.have.members([sampleId10]);
      });
  });

  it("0600: fetch all samples as User 3 (Group 3)", async () => {
    return request(appUrl)
      .g3t("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(4);
      });
  });

  it("0610: fetch all samples as User 4 (Group 4)", async () => {
    return request(appUrl)
      .g3t("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser4}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(3);
      });
  });

  it("0620: fetch all samples as User 5 (Group 5)", async () => {
    return request(appUrl)
      .g3t("/api/v3/Samples")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser5}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(4);
      });
  });

  it("0630: fetch all samples as unauthenticated user", async () => {
    return request(appUrl)
      .g3t("/api/v3/Samples")
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.be.a("array").and.length.should.be.equal(1);
        res.body.should.have.property("isPublished").and.have.members([True]);
      });
  });


  // Access individual sample


  // modify sample


  // delete sample










  // it("0170: fetch this new sample", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Samples/" + sampleId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("owner").and.be.string;
  //       res.body.should.have.property("sampleId").and.be.string;
  //     });
  // });

  // it("0030: should add a new attachment to this sample", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Samples/" + sampleId + "/attachments")
  //     .send(TestData.AttachmentCorrect)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(201)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have
  //         .property("thumbnail")
  //         .and.equal(TestData.AttachmentCorrect.thumbnail);
  //       res.body.should.have
  //         .property("caption")
  //         .and.equal(TestData.AttachmentCorrect.caption);
  //       res.body.should.have
  //         .property("ownerGroup")
  //         .and.equal(TestData.AttachmentCorrect.ownerGroup);
  //       res.body.should.have.property("accessGroups");
  //       res.body.should.have.property("createdBy");
  //       res.body.should.have.property("updatedBy").and.be.string;
  //       res.body.should.have.property("id").and.be.string;
  //       res.body.should.have.property("sampleId").and.equal(sampleId);
  //       attachmentId = res.body["id"];
  //     });
  // });

  // it("0040: should fetch all attachments of this sample", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Samples/" + sampleId + "/attachments/")
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.be.instanceof(Array);
  //     });
  // });

  // // NOTE: Not sure if this one is still needed because this endpoint is not present in the swagger documentation. We are not able to fetch specific attachment under samples.
  // it("0050: should fetch this sample attachment", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Samples/" + sampleId + "/attachments/" + attachmentId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/);
  // });

  // it("0060: should delete this sample attachment", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Samples/" + sampleId + "/attachments/" + attachmentId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200);
  // });

  // it("0070: should return no datasets", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Samples/" + sampleId + "/datasets")
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.be.instanceof(Array);
  //       res.body.length.should.be.equal(0);
  //     });
  // });

  // it("0080: insert dataset using this sample", async () => {
  //   let dataset = { ...TestData.RawCorrect };
  //   dataset.sampleId = sampleId;
  //   return request(appUrl)
  //     .post("/api/v3/Datasets")
  //     .send(dataset)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("owner").and.be.string;
  //       res.body.should.have.property("type").and.equal("raw");
  //       res.body.should.have.property("pid").and.be.string;
  //       datasetId = encodeURIComponent(res.body["pid"]);
  //     });
  // });

  // it("0090: should retrieve dataset for sample", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Samples/" + sampleId + "/datasets")
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.be.instanceof(Array);
  //       res.body.length.should.be.equal(1);
  //       res.body[0].pid.should.be.equal(decodeURIComponent(datasetId));
  //     });
  // });

  // it("0100: should delete the dataset linked to sample", function (done) {
  //   request(appUrl)
  //     .delete("/api/v3/Datasets/" + datasetId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .end((err) => {
  //       if (err) return done(err);
  //       done();
  //     });
  // });

  // it("0110: should delete this sample", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Samples/" + sampleId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/);
  // });
});
