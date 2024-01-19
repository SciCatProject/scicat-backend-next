/* eslint-disable @typescript-eslint/no-var-requires */
//NOTE: Here we load and initialize some global variables that are used throughout the tests

var chaiHttp = require("chai-http");
async function loadChai() {
  const { chai } = import("chai");
  chai.use(chaiHttp);
}
loadChai();

global.appUrl = "http://localhost:3000";
global.request = require("supertest");
