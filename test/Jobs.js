/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");
// Imports used for rabbitmq test
require("dotenv").config();
const amqp = require("amqplib");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser51 = null,
  accessTokenAdmin = null;

let datasetPid1 = null,
  datasetPid2 = null,
  datasetPid3 = null,
  jobIdValidate1 = null,
  encodedJobIdValidate1 = null;

const dataset1 = {
  ...TestData.RawCorrect,
  isPublished: true,
  ownerGroup: "group1",
  accessGroups: ["group5"],
};

const dataset2 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group2",
  accessGroups: [],
};

const dataset3 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group5",
  accessGroups: ["group1"],
};

const archiveJob = {
  type: "archive"
};
const retrieveJob = {
  type: "retrieve"
};
const publicJob = {
  type: "public"
};
const jobValidate = {
  type: "validate"
};
const jobRabbitMQ = {
  type: "rabbitmq"
};

describe("1110: Jobs: Test New Job Model: possible real configurations", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
  });

  beforeEach(async () => {
    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenUser1 = await utils.getToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });

    accessTokenUser51 = await utils.getToken(appUrl, {
      username: "user5.1",
      password: TestData.Accounts["user5.1"]["password"],
    });

    accessTokenAdmin = await utils.getToken(appUrl, {
      username: "admin",
      password: TestData.Accounts["admin"]["password"],
    });
  });

  after(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
  });

  it("0010: adds dataset 1 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group1");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(true);
        res.body.should.have.property("pid").and.be.string;
        datasetPid1 = res.body["pid"];
      });
  });

  it("0020: adds dataset 2 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group2");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid2 = res.body["pid"];
      });
  });

  it("0030: adds dataset 3 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group5");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid3 = res.body["pid"];
      });
  });

  it("0040: Add a new public job as a normal user himself/herself with a published dataset", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0050: Add a new public job as a normal user himself/herself with unpublished datasets, which should fail", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("The following datasets are not public.");
      });
  });

  it("0060: Add a new archive job as a normal user himself/herself with an archivable dataset", async () => {
    const newJob = {
      ...archiveJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0070: Add a new retrieve job as a normal user himself/herself with a non retrievable dataset, which should fail", async () => {
    const newJob = {
      ...retrieveJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("The following datasets are not in retrievable state for a retrieve job.");
      });
  });

  it("0080: Add a new public job as a normal user himself/herself with unknown files, which should fail", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: ["fakeID"] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("At least one requested file could not be found.");
      });
  });

  it("0090: Add a new public job as a normal user himself/herself choosing only specific files", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: ["N1039-1.tif", "N1039-2.tif"] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  describe("1111: Validate Job Action", () => {

    it("0010: create validate job fails without required parameters", async () => {
      const newJob = {
        ...jobValidate,
        jobParams: {
          optionalParam: false,
        },
      };

      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newJob)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Requires 'jobParams.requiredParam'");
        });
    });

    it("0020: create validate job fails with the wrong types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: 123,
          arrayOfStrings: ["ok"]
        },
      };

      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newJob)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for 'jobParams.requiredParam'");
        });
    });
    it("0030: create validate job fails with the wrong types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: "ok",
          arrayOfStrings: "bad"
        },
      };

      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newJob)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for 'jobParams.arrayOfStrings'");
        });
    });
    it("0040: create validate job fails with the wrong types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: "ok",
          arrayOfStrings: [123]
        },
      };

      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newJob)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for 'jobParams.arrayOfStrings'");
        });
    });

    it("0050: create validate succeeds with the right types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: "ok",
          arrayOfStrings: ["ok"]
        },
      };

      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newJob)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("type").and.equal("validate");
          res.body.should.have.property("createdBy").and.equal("admin");
          res.body.should.have.property("jobParams").that.deep.equals(newJob.jobParams);

          jobIdValidate1 = res.body["id"];
          encodedJobIdValidate1 = encodeURIComponent(jobIdValidate1);
        });
    });

    it("0060: update validate fails without the required parameters", async () => {
      const update = {
        statusCode: "finished",
        statusMessage: "done",
        jobResultObject: {
          requiredParam: "ok",
          arrayOfStringsMissing: ["fail"]
        }
      };

      return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobIdValidate1}`)
        .send(update)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for '$'");
        });

    });

    it("0070: update validate fails with incorrect types", async () => {
      const update = {
        statusCode: "finished",
        statusMessage: "done",
        jobResultObject: {
          requiredParam: "ok",
          arrayOfStringsMissing: [123]
        }
      };

      return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobIdValidate1}`)
        .send(update)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for '$'");
        });
    });


    it("0080: updating validate succeeds with the required parameters", async () => {
      const update = {
        statusCode: "finished",
        statusMessage: "done",
        jobResultObject: {
          requiredParam: "ok",
          arrayOfStrings: ["ok"]
        }
      };

      return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobIdValidate1}`)
        .send(update)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("type").and.equal("validate");
          res.body.should.have.property("createdBy").and.equal("admin");
          res.body.should.have.property("jobParams").that.deep.equals(update.jobResultObject);
          res.body.should.have.property("jobResultObject").that.deep.equals(update.jobResultObject);
        });
    });
  });

  describe("1112: RabbitMQ Job Action", () => {
    const config = {
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOSTNAME,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    };
    const QUEUE_NAME = "testQueue";

    let connection;
    let channel;
    let expect;

    before(async () => {
      const chai = await import("chai");
      expect = chai.expect;
      connection = await amqp.connect(config);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME);
    });

    after(async () => {
      await channel.close();
      await connection.close();
    });

    it("0010: Adds a new rabbitMQ job as a normal user himself/herself and expects a message to be sent to the queue.", async () => {
      const newJob = {
        ...jobRabbitMQ,
        ownerUser: "user5.1",
        ownerGroup: "group5",
        jobParams: {
          datasetList: [
            { pid: datasetPid1, files: [] },
          ],
        },
      };

      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newJob)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then(async (res) => {
          res.body.should.have.property("statusCode").to.be.equal("jobCreated");
          const message = await channel.get(QUEUE_NAME, { noAck: true });
          expect(message).to.not.be.null;
          expect(message.content.toString()).to.be.equal(JSON.stringify(res.body));
        });
    });
  });
});
