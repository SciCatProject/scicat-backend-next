/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();

let accessToken = null,
  accessTokenArchiveManager = null,
  accessTokenIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null;

let proposalPid1 = null,
  encodedProposalPid1 = null,
  proposalPid2 = null,
  encodedProposalPid2 = null,
  proposalPid3 = null,
  encodedProposalPid3 = null;

const proposal1 = {
  ...TestData.ProposalCorrectMin,
  proposalId: "20170268",
  ownerGroup: "group4",
  accessGroups: ["group5"],
};

const proposal2 = {
  ...TestData.ProposalCorrectComplete,
  proposalId: "20170269",
  ownerGroup: "group1",
  accessGroups: ["group3"],
};

const proposal3 = {
  ...TestData.ProposalCorrectMin,
  proposalId: "20170270",
  ownerGroup: "group2",
  accessGroups: ["group3"],
};

describe("ProposalAuthorization: Test access to proposal", () => {
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
            username: "proposalIngestor",
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
                    username: "user3",
                    password: "70dc489e8ee823ae815e18d664424df2",
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
      },
    );
  });

  afterEach((done) => {
    sandbox.restore();
    done();
  });

  it("adds proposal 1", async () => {
    return request(appUrl)
      .post("/api/v3/proposals")
      .send(proposal1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group4");
        res.body.should.have.property("proposalId").and.be.string;
        proposalPid1 = res.body["proposalId"];
        encodedProposalPid1 = encodeURIComponent(proposalPid1);
      });
  });

  it("adds proposal 2", async () => {
    return request(appUrl)
      .post("/api/v3/proposals")
      .send(proposal2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group1");
        res.body.should.have.property("proposalId").and.be.string;
        proposalPid2 = res.body["proposalId"];
        encodedProposalPid2 = encodeURIComponent(proposalPid2);
      });
  });

  it("adds proposal 3", async () => {
    return request(appUrl)
      .post("/api/v3/proposals")
      .send(proposal3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group2");
        res.body.should.have.property("proposalId").and.be.string;
        proposalPid3 = res.body["proposalId"];
        encodedProposalPid3 = encodeURIComponent(proposalPid3);
      });
  });

  it("cannot access proposal as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid2)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(401);
  });

  it("admin can list all proposals", async () => {
    return request(appUrl)
      .get("/api/v3/proposals")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("access proposal 1 as admin", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["proposalId"].should.be.equal(proposalPid1);
      });
  });

  it("full query for proposals for admin", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("access proposal 2 as admin", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["proposalId"].should.be.equal(proposalPid2);
      });
  });

  it("access proposal 3 as admin", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["proposalId"].should.be.equal(proposalPid3);
      });
  });

  it("list of proposals for user 1", async () => {
    return request(appUrl)
      .get("/api/v3/proposals")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["proposalId"].should.be.equal(proposalPid2);
      });
  });

  it("access proposal 1 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + 20170268)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("access proposal 2 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["proposalId"].should.be.equal(proposalPid2);
      });
  });

  it("access proposal 3 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("full query for proposals for user 1", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["proposalId"].should.be.equal(proposalPid2);
      });
  });

  it("list of proposals for user 2", async () => {
    return request(appUrl)
      .get("/api/v3/proposals")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        res.body[1]["proposalId"].should.be.equal(proposalPid3);
      });
  });

  it("access proposal 1 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("access proposal 2 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["proposalId"].should.be.equal(proposalPid2);
      });
  });

  it("access proposal 3 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/" + encodedProposalPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["proposalId"].should.be.equal(proposalPid3);
      });
  });

  it("full query for proposals for user 2", async () => {
    return request(appUrl)
      .get("/api/v3/proposals/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        res.body[0]["proposalId"].should.be.equal(proposalPid2);
        res.body[1]["proposalId"].should.be.equal(proposalPid3);
      });
  });

  it("full facet for proposals for user 2", async () => {
    return request(appUrl)
      .get(`/api/v3/proposals/fullfacet`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body[0].all[0].totalSets.should.be.equal(2);
      });
  });

  it("should delete proposal 1", async () => {
    return request(appUrl)
      .delete("/api/v3/Proposals/" + proposalPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete proposal 2", async () => {
    return request(appUrl)
      .delete("/api/v3/Proposals/" + proposalPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete proposal 3", async () => {
    return request(appUrl)
      .delete("/api/v3/Proposals/" + proposalPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
