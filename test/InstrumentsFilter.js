/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();

let accessTokenIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  accessTokenUser3 = null,
  accessTokenArchiveManager = null;

let instrumentPid1 = null,
  encodedInstrumentPid1 = null,
  instrumentPid2 = null,
  encodedInstrumentPid2 = null,
  instrumentPid3 = null,
  encodedInstrumentPid3 = null,
  instrumentPid4 = null,
  encodedInstrumentPid4 = null;

const InstrumentCorrect1 = {
  ...TestData.InstrumentCorrect1,
  name: "ESS instrument one",
};

const InstrumentCorrect2 = {
  ...TestData.InstrumentCorrect2,
  name: "ESS instrument two",
};

const InstrumentCorrect3 = {
  ...TestData.InstrumentCorrect3,
  name: "Another instrument at ESS, number three",
};

const InstrumentCorrect4 = {
  ...TestData.InstrumentCorrect3,
  uniqueName: "ESS3-2",
  name: "Yet another instrument at ESS, a new number three different from the other",
};

describe("InstrumentFilter: Test retrieving instruments using filtering capabilities", () => {
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

  afterEach((done) => {
    sandbox.restore();
    done();
  });

  it("adds instrument 1", async () => {
    return request(appUrl)
      .post("/api/v3/Instruments")
      .send(InstrumentCorrect1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("name")
          .and.equal(InstrumentCorrect1.name);
        instrumentPid1 = res.body["pid"];
        encodedInstrumentPid1 = encodeURIComponent(instrumentPid1);
      });
  });

  it("adds instrument 2", async () => {
    return request(appUrl)
      .post("/api/v3/Instruments")
      .send(InstrumentCorrect2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("name")
          .and.equal(InstrumentCorrect2.name);
        instrumentPid2 = res.body["pid"];
        encodedInstrumentPid2 = encodeURIComponent(instrumentPid2);
      });
  });

  it("adds instrument 3", async () => {
    return request(appUrl)
      .post("/api/v3/Instruments")
      .send(InstrumentCorrect3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("name")
          .and.equal(InstrumentCorrect3.name);
        instrumentPid3 = res.body["pid"];
        encodedInstrumentPid3 = encodeURIComponent(instrumentPid3);
      });
  });

  it("adds instrument 4", async () => {
    return request(appUrl)
      .post("/api/v3/Instruments")
      .send(InstrumentCorrect4)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("name")
          .and.equal(InstrumentCorrect4.name);
        instrumentPid4 = res.body["pid"];
        encodedInstrumentPid4 = encodeURIComponent(instrumentPid4);
      });
  });

  it("retrieve single instrument by its name", async () => {
    const query = { where: { name: InstrumentCorrect1.name } };
    return request(appUrl)
      .get("/api/v3/Instruments")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(instrumentPid1);
      });
  });

  it('retrieve instruments with "ESS instrument" in name using loopback style "like" operator', async () => {
    const query = { where: { name: { like: "ESS instrument" } } };
    return request(appUrl)
      .get("/api/v3/Instruments")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  // it("count how many instruments with \"ESS instrument\" in name using loopback style \"like\" operator", async () => {
  //   const query = { where: { name: { like: "ESS instrument" }}};
  //   return request(appUrl)
  //     .get("/api/v3/Instruments/count")
  //     .set({ Authorization: `Bearer ${accessTokenIngestor}` })
  //     .query("filter=" + encodeURIComponent(JSON.stringify(query)))
  //     .set("Accept", "application/json")
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body["count"].should.be.equal(2);
  //     });
  // });

  it('retrieve one instrument with "ESS instrument" in name using loopback style "like" operator', async () => {
    const query = { where: { name: { like: "ESS instrument" } } };
    return request(appUrl)
      .get("/api/v3/Instruments/findOne")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.oneOf([instrumentPid1, instrumentPid2]);
      });
  });

  it('retrieve instruments with "ESS instrument" in instrument name using mongo regex operator', async () => {
    const query = { where: { name: { $regex: "ESS instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  // it("count how many instruments with \"ESS instrument\" in instrument name using mongo regex operator", async () => {
  //   const query = { where: { name: { "$regex": "ESS instrument" }}};
  //   return request(appUrl)
  //     .get("/api/v3/instruments/count")
  //     .set({ Authorization: `Bearer ${accessTokenIngestor}` })
  //     .query("filter=" + encodeURIComponent(JSON.stringify(query)))
  //     .set("Accept", "application/json")
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body["count"].should.be.equal(3);
  //     });
  // });

  it('retrieve one instruments with "ESS instrument" in instrument name using mongo regex operator', async () => {
    const query = { where: { name: { $regex: "ESS instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments/findOne")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.oneOf([instrumentPid1, instrumentPid2]);
      });
  });

  it('retrieve instruments with "Another instrument" in instrument name using loopback style "like" operator', async () => {
    const query = { where: { name: { like: "Another instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(instrumentPid3);
      });
  });

  it('retrieve one instrument with "Another instrument" in instrument name using loopback style "like" operator', async () => {
    const query = { where: { name: { like: "Another instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments/findOne")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.equal(instrumentPid3);
      });
  });

  // it("count how many instruments with \"Another instrument\" in instrument name using loopback style \"like\" operator", async () => {
  //   const query = { where: { name: { like: "Another instrument" }}};
  //   return request(appUrl)
  //     .get("/api/v3/instruments/count")
  //     .set({ Authorization: `Bearer ${accessTokenIngestor}` })
  //     .query("filter=" + encodeURIComponent(JSON.stringify(query)))
  //     .set("Accept", "application/json")
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body["count"].should.be.equal(1);
  //     });
  // });

  it('retrieve instruments with "Another instrument" in instrument name using mongo "regex" operator', async () => {
    const query = { where: { name: { $regex: "Another instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(instrumentPid3);
      });
  });

  it('retrieve one instrument with "Another instrument" in instrument name using mongo "regex" operator', async () => {
    const query = { where: { name: { $regex: "Another instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments/findOne")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.equal(instrumentPid3);
      });
  });

  // it("count how many instruments with \"Another instrument\" in instrument name using mongo \"regex\" operator", async () => {
  //   const query = { where: { name: { "$regex": "Another instrument" }}};
  //   return request(appUrl)
  //     .get("/api/v3/instruments/count")
  //     .set({ Authorization: `Bearer ${accessTokenIngestor}` })
  //     .query("filter=" + encodeURIComponent(JSON.stringify(query)))
  //     .set("Accept", "application/json")
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body["count"].should.be.equal(1);
  //     });
  // });

  it('retrieve instruments with "another" and "instrument" in name using "regex" operator', async () => {
    const query = { where: { name: { $regex: "[Aa]nother instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        res.body[0]["pid"].should.be.oneOf([instrumentPid3, instrumentPid4]);
        res.body[1]["pid"].should.be.oneOf([instrumentPid3, instrumentPid4]);
      });
  });

  it('retrieve one instrument with "another" and "instrument" in description using "regex" operator', async () => {
    const query = { where: { name: { $regex: "[Aa]nother instrument" } } };
    return request(appUrl)
      .get("/api/v3/instruments/findOne")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.oneOf([instrumentPid3, instrumentPid4]);
      });
  });

  // it("count how many instruments with \"another\" and \"instrument\" in description using \"regex\" operator", async () => {
  //   const query = { where: { name: { "$regex": "[Aa]nother] instrument" }}};
  //   return request(appUrl)
  //     .get("/api/v3/instruments/count")
  //     .set({ Authorization: `Bearer ${accessTokenIngestor}` })
  //     .query("filter=" + encodeURIComponent(JSON.stringify(query)))
  //     .set("Accept", "application/json")
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body["count"].should.be.equal(2);
  //     });
  // });

  it("should delete instrument 1", async () => {
    return request(appUrl)
      .delete("/api/v3/instruments/" + instrumentPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete instrument 2", async () => {
    return request(appUrl)
      .delete("/api/v3/instruments/" + instrumentPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete instrument 3", async () => {
    return request(appUrl)
      .delete("/api/v3/instruments/" + instrumentPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete instrument 4", async () => {
    return request(appUrl)
      .delete("/api/v3/instruments/" + instrumentPid4)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
