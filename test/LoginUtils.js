/* eslint-disable @typescript-eslint/no-var-requires */
var request = require("supertest");

exports.getToken = function (appUrl, user) {
  return new Promise((resolve, reject) => {
    request(appUrl)
      .post("/api/v3/Users/Login?include=user")
      .send(user)
      .set("Accept", "application/json")
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.id);
        }
      });
  });
};

exports.getIdAndToken = function (appUrl, user) {
  return new Promise((resolve, reject) => {
    request(appUrl)
      .post("/api/v3/Users/Login?include=user")
      .send(user)
      .set("Accept", "application/json")
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({userId:res.body.userId,  token:res.body.id});
        }
      });
    });
};

exports.getTokenAD = function (appUrl, user, cb) {
  request(appUrl)
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
