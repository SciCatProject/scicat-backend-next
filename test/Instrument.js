/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessToken = null,
  accessTokenArchiveManager = null,
  instrumentId = null;

const newName = "ESS2.5";

describe("Instrument: Instrument management", () => {
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

  it("adds new instrument", async () => {
    return request(appUrl)
      .post("/api/v3/Instruments")
      .send(TestData.InstrumentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("name")
          .and.be.equal(TestData.InstrumentCorrect.name);
        res.body.should.have.property("pid").and.be.string;
        instrumentId = res.body["pid"];
      });
  });

  it("should fetch this new instrument", async () => {
    return request(appUrl)
      .get("/api/v3/Instruments/" + instrumentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("name")
          .and.be.equal(TestData.InstrumentCorrect.name);
        res.body.should.have.property("pid").and.be.equal(instrumentId);
      });
  });

  it("should fetch all instruments", async () => {
    return request(appUrl)
      .get("/api/v3/Instruments")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.length(1);
        res.body[0].should.have
          .property("name")
          .and.be.equal(TestData.InstrumentCorrect.name);
        res.body[0].should.have.property("pid").and.be.equal(instrumentId);
      });
  });

  it("should update the instrument name", async () => {
    return request(appUrl)
      .patch("/api/v3/Instruments/" + instrumentId)
      .send({ name: newName })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("name").and.be.equal(newName);
        res.body.should.have.property("pid").and.be.equal(instrumentId);
      });
  });

  it("should fetch this same instrument", async () => {
    return request(appUrl)
      .get("/api/v3/Instruments/" + instrumentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("name").and.be.equal(newName);
        res.body.should.have.property("pid").and.be.equal(instrumentId);
      });
  });

  it("should delete this instrument", async () => {
    return request(appUrl)
      .delete("/api/v3/Instruments/" + instrumentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
