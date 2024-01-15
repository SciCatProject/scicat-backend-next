/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();

let accessTokenIngestor = null,
  userIdIngestor = null,
  accessTokenAdmin = null,
  userIdAdmin = null,
  accessTokenUser1 = null,
  userIdUser1 = null,
  accessTokenUser2 = null,
  userIdUser2 = null,
  accessTokenUser3 = null,
  userIdUser3 = null,
  accessTokenUser4 = null,
  userIdUser4 = null,
  accessTokenArchiveManager = null,
  userIdArchiveManager = null;

describe("2300: User Authorization: test that user authorization are correct", () => {
  beforeEach((done) => {
    utils.getIdAndToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (idVal, tokenVal) => {
        accessTokenIngestor = tokenVal;
        userIdIngestor = idVal;
        utils.getIdAndToken(
          appUrl,
          {
            username: "user1",
            password: "a609316768619f154ef58db4d847b75e",
          },
          (idVal, tokenVal) => {
            accessTokenUser1 = tokenVal;
            userIdUser1 = idVal;
            utils.getIdAndToken(
              appUrl,
              {
                username: "user2",
                password: "f522d1d715970073a6413474ca0e0f63",
              },
              (idVal, tokenVal) => {
                accessTokenUser2 = tokenVal;
                userIdUser2 = idVal;
                utils.getIdAndToken(
                  appUrl,
                  {
                    username: "user3",
                    password: "70dc489e8ee823ae815e18d664424df2",
                  },
                  (idVal, tokenVal) => {
                    accessTokenUser3 = tokenVal;
                    userIdUser3 = idVal;
                    utils.getIdAndToken(
                      appUrl,
                      {
                        username: "user4",
                        password: "0014890e7020f515b92b767227ef2dfa",
                      },
                      (idVal, tokenVal) => {
                        accessTokenUser4 = tokenVal;
                        userIdUser4 = idVal;
                        utils.getIdAndToken(
                          appUrl,
                          {
                            username: "archiveManager",
                            password: "aman",
                          },
                          (idVal, tokenVal) => {
                            accessTokenArchiveManager = tokenVal;
                            userIdArchiveManager = idVal;
                            utils.getIdAndToken(
                              appUrl,
                              {
                                username: "admin",
                                password: "am2jf70TPNZsSan",
                              },
                              (idVal, tokenVal) => {
                                accessTokenAdmin = tokenVal;
                                userIdAdmin = idVal;
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
  });

  afterEach((done) => {
    sandbox.restore();
    done();
  });

  it("0010: ingestor should be able to check if he/she can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdIngestor}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0020: admin should be able to check if he can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0030: admin should be able to check that user 1 can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0040: admin should be able to check that user 2 can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0050: admin should be able to check that user 3 can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser3}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0060: admin should be able to check that user 4 can not create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser4}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(false);
      });
  });

  it("0070: user 1 should be able to check that he/she to create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0080: user 1 should not be able to check that admin can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0090: user 1 should not be able to check that user 2 can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0100: user 1 should not be able to check that user 3 can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser3}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0110: user 1 should not be able to check that user 4 can not create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser4}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0120: user 2 should be able to check that he/she can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0130: user 3 should be able to check that he/she can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser3}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(true);
      });
  });

  it("0140: user 4 should be able to check that he/she can not create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser4}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser4}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.authorization.should.be.equal(false);
      });
  });

  it("0144: anonymous user should not be able to check that admin can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0146: anonymous user should not be able to check that user 1 can create a dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}/authorization/dataset/create`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0150: anonymous user should be able to retrieve a jwt token", async () => {
    return request(appUrl)
      .post(`/api/v3/users/jwt`)
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.jwt.should.be.a("string");
      });
  });

  it("0160: admin user should be able to retrieve a new jwt token", async () => {
    return request(appUrl)
      .post(`/api/v3/users/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.jwt.should.be.a("string");
      });
  });

  it("0170: user1 user should be able to retrieve a new jwt token", async () => {
    return request(appUrl)
      .post(`/api/v3/users/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.jwt.should.be.a("string");
      });
  });

  it("0180: admin should be able to view his/her user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.username.should.be.equal("admin");
      });
  });

  it("0190: admin should be able to view user 1 user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.username.should.be.equal("user1");
      });
  });

  it("0200: user1 should be able to view his/her user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.username.should.be.equal("user1");
      });
  });

  it("0210: user1 should not be able to view admin user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0220: user1 should not be able to view user2 user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0230: anonymous user should not be able to view admin user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0240: anonymous user should not be able to view user1 user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0250: admin should be able to view his/her user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/userIdentity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.profile.username.should.be.equal("admin");
      });
  });

  it("0260: admin should be able to view user 1 user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/userIdentity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.profile.username.should.be.equal("user1");
      });
  });

  it("0270: user1 should be able to view his/her user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/userIdentity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.profile.username.should.be.equal("user1");
      });
  });

  it("0280: user1 should not be able to view admin user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/userIdentity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0290: user1 should not be able to view user2 user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}/userIdentity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0300: anonymous user should not be able to view admin user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/userIdentity`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0310: anonymous user should not be able to view user1 user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/userIdentity`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0320: admin should be able to view his/her user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdAdmin);
      });
  });

  it("0330: admin should be able to view user 1 user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdUser1);
      });
  });

  it("0340: user1 should be able to view his/her user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdUser1);
      });
  });

  it("0350: user1 should not be able to view admin user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0360: user1 should not be able to view user2 user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser2}/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403);
  });

  it("0370: anonymous user should not be able to view admin user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdAdmin}/settings`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0380: anonymous user should not be able to view user1 user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/${userIdUser1}/settings`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0390: admin should be able to view his/her user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdAdmin } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdAdmin);
      });
  });

  it("0400: admin should be able to view user 1 user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdUser1 } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdUser1);
      });
  });

  it("0410: user1 should be able to view his/her user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdUser1 } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdUser1);
      });
  });

  it("0420: user1 should not be able to view admin user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdAdmin } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(403);
  });

  it("0430: user1 should not be able to view user2 user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdUser2 } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(403);
  });

  it("0440: anonymous user should not be able to view admin user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdAdmin } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(401);
  });

  it("0450: anonymous user should not be able to view user1 user identity through userIdentity endpoint", async () => {
    const query = { where: { userId: userIdUser1 } };
    return request(appUrl)
      .get(`/api/v3/userIdentities/findOne`)
      .set("Accept", "application/json")
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .expect(401);
  });

  it("0460: admin should be able to create a custom jwt token for him/her-self", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdAdmin}/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .send({
        expiresIn: "never",
      })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.jwt.should.be.a("string");
      });
  });

  it("0470: admin should be able to create a custom jwt token for user 1", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdUser1}/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .send({
        expiresIn: "never",
      })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.jwt.should.be.a("string");
      });
  });

  it("0480: user1 should be not able to create a custom jwt token for him/her-self, as he/she is not an admin", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdUser1}/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .send({
        expiresIn: "never",
      })
      .expect(403);
  });

  it("0490: user1 should not be able to create a custom jwt token for admin user", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdAdmin}/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .send({
        expiresIn: "never",
      })
      .expect(403);
  });

  it("0500: user1 should not be able to create a custom jwt token for user2 user", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdUser2}/jwt`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .send({
        expiresIn: "never",
      })
      .expect(403);
  });

  it("0510: anonymous user should not be create custom jwt token for admin user", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdAdmin}/jwt`)
      .set("Accept", "application/json")
      .send({
        expiresIn: "never",
      })
      .expect(401);
  });

  it("0520: anonymous user should not be able to create jwt token for view user1", async () => {
    return request(appUrl)
      .post(`/api/v3/users/${userIdUser1}/jwt`)
      .set("Accept", "application/json")
      .send({
        expiresIn: "never",
      })
      .expect(401);
  });

  it("0530: admin should be able to view her user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/self`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.username.should.be.equal("admin");
        res.body.id.should.be.equal(userIdAdmin);
      });
  });

  it("0540: admin should be able to view her user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/identity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdAdmin);
        res.body.profile.username.should.be.equal("admin");
      });
  });

  it("0550: admin should be able to view her user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdAdmin);
      });
  });

  it("0560: ingestor should be able to view her user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/self`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.username.should.be.equal("ingestor");
        res.body.id.should.be.equal(userIdIngestor);
      });
  });

  it("0570: ingestor should be able to view her user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/identity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdIngestor);
        res.body.profile.username.should.be.equal("ingestor");
      });
  });

  it("0580: ingestor should be able to view her user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdIngestor);
      });
  });

  it("0590: user 1 should be able to view her user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/self`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.username.should.be.equal("user1");
        res.body.id.should.be.equal(userIdUser1);
      });
  });

  it("0600: user 1 should be able to view her user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/identity`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdUser1);
        res.body.profile.username.should.be.equal("user1");
      });
  });

  it("0610: user 1 should be able to view her user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/settings`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.userId.should.be.equal(userIdUser1);
      });
  });

  it("0620: anonymous user should not be able to view her non exisiting user profile", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/self`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0630: anonymous user should not be able to view her non existing user identity", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/identity`)
      .set("Accept", "application/json")
      .expect(401);
  });

  it("0640: anonymous user should not be able to view her non exisiting user settings", async () => {
    return request(appUrl)
      .get(`/api/v3/users/my/settings`)
      .set("Accept", "application/json")
      .expect(401);
  });
});
