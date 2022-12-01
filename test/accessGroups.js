/* eslint-disable @typescript-eslint/no-var-requires */
var utils = require("./LoginUtils");

// describe("Access groups test", () => {
// beforeEach(async () => {
//   // TODO: Should hit endpoint to create user without any accessGroups
// });
//   it("Make a request with user that has no accessGroups in his profile should succeed", async () => {
//     const loginResponse = await request(appUrl)
//       .post("/api/v3/Users/Login?include=user")
//       .send({
//         username: "noGroup",
//         password: "aman",
//       })
//       .set("Accept", "application/json");

//     const datasetResponse = await request(appUrl)
//       .get(`/api/v3/Datasets?access_token=${loginResponse.body.id}`)
//       .set("Accept", "application/json");
//     datasetResponse.statusCode.should.equal(200);
//   });

//   it("Make a request with user that has not an Array as accessGroups in his profile should fail", async () => {
//     userIdentity.profile.accessGroups = 1;
//     userIdentity.save();
//     const loginResponse = await request(appUrl)
//       .post("/api/v3/Users/Login?include=user")
//       .send({
//         username: "noGroup",
//         password: "aman",
//       })
//       .set("Accept", "application/json");

//     const datasetResponse = await request(appUrl)
//       .get(`/api/v3/Datasets?access_token=${loginResponse.body.id}`)
//       .set("Accept", "application/json");
//     datasetResponse.statusCode.should.equal(500);
//   });

//   it("Make a request with user that has an Array as accessGroups in his profile should succeed", async () => {
//     userIdentity.profile.accessGroups = ["group1", "goup2"];
//     userIdentity.save();
//     const loginResponse = await request(appUrl)
//       .post("/api/v3/Users/Login?include=user")
//       .send({
//         username: "noGroup",
//         password: "aman",
//       })
//       .set("Accept", "application/json");

//     const datasetResponse = await request(appUrl)
//       .get(`/api/v3/Datasets?access_token=${loginResponse.body.id}`)
//       .set("Accept", "application/json");
//     datasetResponse.statusCode.should.equal(200);
//   });
// });
