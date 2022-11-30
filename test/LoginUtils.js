/* eslint-disable @typescript-eslint/no-var-requires */
var request = require("supertest");

exports.getToken = function (app, user, cb) {
  request(app)
    .post("/api/v3/Users/Login?include=user")
    .send(user)
    .set("Accept", "application/json")
    .end((err, res) => {
      if (err) {
        cb(err);
      } else {
        cb(res.body.id);
      }
    });
};

exports.getTokenAD = function (app, user, cb) {
  request(app)
    .post("/auth/msad")
    .send(user)
    .set("Accept", "application/json")
    .end((err, res) => {
      if (err) {
        cb(err);
      } else {
        cb(res.body.access_token);
      }
    });
};
