"use strict";
"esversion: 6";

var supertest = require("supertest");
var async = require("async");

// Code to generate  simple mocha tests via configuration files

module.exports = {
  run: function (conf, app, settings, callback) {
    var server;
    var agent = supertest.agent(settings.baseURL);

    if (typeof conf !== "object" || typeof settings !== "object")  {
      return callback("Failed to load test configuration from file");
    }

    if (app) {
      before(function (done) {
        console.log("Starting local webserver:",new Date());
        server = app.listen(done);
      });

      after(function (done) {
        server.close(done);
      });
    }

    describe("Loopback API", function () {
      const required = ["method", "route", "expect"];
      async.each(conf, function (c, asyncCallback) {

        required.map(prop => {
          if (!c.hasOwnProperty(prop)) {
            console.log(prop + "  not specified");
            return asyncCallback();
          }
        });

        const route = c.route;
        const method = c.method;
        const expect = c.expect;
        const url = settings.apiPrefix + route;
        const withData = c.body || false;
        const isWithAuthentication = c.authenticate || false;



        var authenticationDescription = (isWithAuthentication) ? "authenticated" : "unauthenticated";



        var description = "should respond " + c.expect + " on " + authenticationDescription + " " + c.method + " requests to /" + c.route;
        var parsedMethod;
        var loginBlock;

        if (c.method.toUpperCase() === "GET") {
          parsedMethod = agent.get(url);
        } else if (c.method.toUpperCase() === "POST") {
          parsedMethod = agent.post(url);
        } else if (c.method.toUpperCase() === "PUT") {
          parsedMethod = agent.put(url);
        } else if (c.method.toUpperCase() === "DELETE") {
          parsedMethod = agent.delete(url);
        } else if (c.method.toUpperCase() === "PATCH") {
          parsedMethod = agent.patch(url);
        } else {
          callback("Test has an unrecognized method type");
          return asyncCallback();
        }

        if (isWithAuthentication) {
          var user = settings.users[c.authenticate];
          loginBlock = function (loginCallback) {
            agent
              .post(user.login)
              .send(user)
              .set("Accept", "application/json")
              .set("Content-Type", "application/json")
              .expect(200)
              .end(function (err, authRes) {
                if (err) {
                  return loginCallback("Could not log in with provided credentials", null);
                }

                var token = authRes.body.id || authRes.body.access_token;

                return loginCallback(null, token);
              });
          };
        } else {
          loginBlock = function (loginCallback) {
            return loginCallback(null, null);
          };
        }

        it(description, function (done) {
          loginBlock(function (loginError, loginToken) {
            if (loginError) {
              done(loginError);
              return asyncCallback();
            }

            if (loginToken) {
              parsedMethod = parsedMethod.set("Authorization", loginToken);
            }

            if (c.body || false) {
              parsedMethod = parsedMethod.send(c.body)
                .set("Content-Type", "application/json");
            }

            parsedMethod
              .expect(c.expect)
              .end(function (err, res) {
                if (err) {
                  done(err);
                  return asyncCallback();
                } else {
                  (c.response || []).map(check => {
                    eval(check);
                  });
                  done();
                  return asyncCallback();
                }
              });
          });
        });
      });
    });
  }
};
