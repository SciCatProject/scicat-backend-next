/* eslint-disable @typescript-eslint/no-var-requires */
//NOTE: Here we load and initialize some global variables that are used throughout the tests

var chaiHttp = require("chai-http");
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/scicat";

const client = new MongoClient(uri);

async function loadChai() {
  const { chai } = import("chai");
  chai.use(chaiHttp);
  await client.connect();
}
loadChai();

global.appUrl = "http://localhost:3000";
global.request = require("supertest");
global.db = client.db("scicat");
