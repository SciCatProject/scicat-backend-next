/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const { faker } = require("@faker-js/faker");
var utils = require("./LoginUtils");

const NUMBER_OF_DATASETS_TO_CREATE = 100;

let accessTokenIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  accessTokenUser3 = null,
  accessTokenArchiveManager = null;

let groupedDatasets = {
  1: [],
  2: [],
  3: [],
  4: [],
};

function generateRandomDataset() {
  return {
    principalInvestigator: faker.internet.email(),
    endTime: faker.date.past().toISOString(),
    creationLocation: faker.system.directoryPath(),
    dataFormat: faker.random.words(3),
    scientificMetadata: {
      approx_file_size_mb: {
        value: faker.random.numeric(5),
        unit: "bytes",
      },
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
    owner: faker.name.fullName(),
    ownerEmail: faker.internet.email(),
    orcidOfOwner: faker.database.mongodbObjectId(),
    contactEmail: faker.internet.email(),
    sourceFolder: faker.system.directoryPath(),
    size: 0,
    packedSize: 0,
    numberOfFiles: 0,
    numberOfFilesArchived: 0,
    creationTime: faker.date.past().toISOString(),
    description: faker.random.words(10),
    datasetName: faker.random.words(2),
    classification: "AV=medium,CO=low",
    license: "CC BY-SA 4.0",
    isPublished: false,
    ownerGroup: faker.helpers.arrayElement([
      "group1",
      "group2",
      "group3",
      "group4",
    ]),
    accessGroups: [],
    proposalId: process.env.PID_PREFIX
      ? process.env.PID_PREFIX
      : "" + faker.random.numeric(6),
    type: "raw",
    keywords: ["sls", "protein"],
  };
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function addDataset() {
  const dataset = generateRandomDataset();

  return request(appUrl)
    .post("/api/v3/Datasets")
    .send(dataset)
    .set("Accept", "application/json")
    .set({ Authorization: `Bearer ${accessTokenIngestor}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((result) => {
      if (result.body) {
        return result.body;
      } else {
        throw new Error(
          "Something went wrong while creating dataset:" +
            JSON.stringify(dataset),
        );
      }
    })
    .catch((error) => {
      throw new Error(
        "Something went wrong while creating dataset:" +
          JSON.stringify(dataset) +
          error,
      );
    });
}

function removeDataset(datasetPid) {
  return request(appUrl)
    .delete("/api/v3/datasets/" + encodeURIComponent(datasetPid))
    .set("Accept", "application/json")
    .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((result) => {
      return result.body;
    });
}

async function addAllDatasets() {
  const allPromises = [];

  for (let index = 0; index < NUMBER_OF_DATASETS_TO_CREATE; index++) {
    allPromises.push(addDataset());
  }

  await Promise.all(allPromises).then(function (values) {
    groupedDatasets[1] = values.filter(
      (value) => value.ownerGroup === "group1",
    );
    groupedDatasets[2] = values.filter(
      (value) => value.ownerGroup === "group2",
    );
    groupedDatasets[3] = values.filter(
      (value) => value.ownerGroup === "group3",
    );
    groupedDatasets[4] = values.filter(
      (value) => value.ownerGroup === "group4",
    );
  });
}

async function removeAllDatasets() {
  const allPromises = [];
  const allDatasets = groupedDatasets[1]
    .concat(groupedDatasets[2])
    .concat(groupedDatasets[3])
    .concat(groupedDatasets[4]);

  for (let index = 0; index < allDatasets.length; index++) {
    const dataset = allDatasets[index];
    allPromises.push(removeDataset(dataset.pid));
  }

  return Promise.all(allPromises);
}

describe("Randomized Datasets: permission test with bigger amount of data", async () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessTokenIngestor = tokenVal;
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
                    username: "user3",
                    password: "70dc489e8ee823ae815e18d664424df2",
                  },
                  (tokenVal) => {
                    accessTokenUser3 = tokenVal;
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
      },
    );
  });

  it("access private dataset as unauthenticated user", async () => {
    await addAllDatasets();
    const randomGroup = randomIntFromInterval(1, 4);

    return request(appUrl)
      .get(
        "/api/v3/Datasets/" +
          encodeURIComponent(groupedDatasets[randomGroup][0].pid),
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("list of datasets for ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be
          .an("array")
          .to.have.lengthOf(NUMBER_OF_DATASETS_TO_CREATE);
      });
  });

  it("access any dataset as ingestor", async () => {
    const randomGroupIndex = randomIntFromInterval(1, 4);
    const randomIndex = randomIntFromInterval(
      0,
      groupedDatasets[randomGroupIndex].length - 1,
    );
    const randomDatasetPid = groupedDatasets[randomGroupIndex][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(randomDatasetPid);
      });
  });

  it("full query for datasets for ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be
          .an("array")
          .to.have.lengthOf(NUMBER_OF_DATASETS_TO_CREATE);
      });
  });

  it("list of datasets for user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be
          .an("array")
          .to.have.lengthOf(groupedDatasets[1].length);
      });
  });

  it("access any dataset from group1 ownerGroup as user 1", async () => {
    const randomIndex = randomIntFromInterval(0, groupedDatasets[1].length - 1);
    const randomDatasetPid = groupedDatasets[1][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(randomDatasetPid);
      });
  });

  it("access dataset from another ownerGroup as user 1", async () => {
    const randomGroupIndex = randomIntFromInterval(1, 3);
    const randomIndex = randomIntFromInterval(
      0,
      groupedDatasets[randomGroupIndex].length - 1,
    );
    const randomDatasetPid = groupedDatasets[randomGroupIndex][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("list of datasets for user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be
          .an("array")
          .to.have.lengthOf(groupedDatasets[2].length);
      });
  });

  it("access any dataset from group2 ownerGroup as user 2", async () => {
    const randomIndex = randomIntFromInterval(0, groupedDatasets[2].length - 1);
    const randomDatasetPid = groupedDatasets[2][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(randomDatasetPid);
      });
  });

  it("access dataset from another ownerGroup as user 2", async () => {
    const randomGroupIndex = faker.helpers.arrayElement(["1", "3", "4"]);
    const randomIndex = randomIntFromInterval(
      0,
      groupedDatasets[randomGroupIndex].length - 1,
    );
    const randomDatasetPid = groupedDatasets[randomGroupIndex][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("list of datasets for user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be
          .an("array")
          .to.have.lengthOf(groupedDatasets[3].length);
      });
  });

  it("access any dataset from group3 ownerGroup as user 3", async () => {
    const randomIndex = randomIntFromInterval(0, groupedDatasets[3].length - 1);
    const randomDatasetPid = groupedDatasets[3][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(randomDatasetPid);
      });
  });

  it("access dataset from another ownerGroup as user 3", async () => {
    const randomGroupIndex = faker.helpers.arrayElement(["1", "2", "4"]);
    const randomIndex = randomIntFromInterval(
      0,
      groupedDatasets[randomGroupIndex].length - 1,
    );
    const randomDatasetPid = groupedDatasets[randomGroupIndex][randomIndex].pid;

    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(randomDatasetPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("should remove all created random datasets", async () => {
    return await removeAllDatasets().then((values) => {
      values.length.should.be.equal(NUMBER_OF_DATASETS_TO_CREATE);
    });
  });
});
