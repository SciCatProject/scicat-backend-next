/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const rison = require("rison");
const superagent = require("superagent");
const utils = require("./LoginUtils");
const config = require("../server/config.local");

const scichatBaseUrl = config.scichatUrl;

let accessToken = null;

let app;
let testRoomId;
before(done => {
    app = require("../server/server");

    // postTestRoom()
    //     .then(roomResponse => {
    //         testRoomId = roomResponse.id;

    //         return postTestMessage(roomResponse.id);
    //     })
    //     .catch(err => {
    //         console.error("postTestRoomError: " + err);
    //     });
    done();
});

// after(done => {
//     deleteTestMessage(testRoomId).then(() => {
//         return deleteTestRoom(testRoomId);
//     });
//     done();
// });

describe("Simple Logbook test", function() {
    before(done => {
        utils.getToken(
            app,
            {
                username: "ingestor",
                password: "aman"
            },
            tokenVal => {
                accessToken = tokenVal;
                done();
            }
        );
    });

    // it("should fetch a Logbook", function(done) {
    //     let name = "string";
    //     request(app)
    //         .get(`/api/v3/Logbooks/${name}?access_token=${accessToken}`)
    //         .set("Accept", "application/json")
    //         .expect(200)
    //         .expect("Content-Type", /json/)
    //         .end(function(err, res) {
    //             if (err) {
    //                 return done(err);
    //             }
    //             res.body.should.have.property("id").and.be.string;
    //             res.body.should.have.property("name").and.equal(name);
    //             res.body.should.have
    //                 .property("messages")
    //                 .and.be.instanceof(Array);
    //             done();
    //         });
    // });

    it("should fetch all Logbooks", function(done) {
        request(app)
            .get(`/api/v3/Logbooks?access_token=${accessToken}`)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.be.instanceof(Array);
                done();
            });
    });

    // it("should fetch a filtered Logbook", function(done) {
    //     let name = "string";
    //     let filter = rison.encode_object({
    //         textSearch: "Test",
    //         showBotMessages: true,
    //         showUserMessages: true,
    //         showImages: true
    //     });
    //     request(app)
    //         .get(
    //             `/api/v3/Logbooks/${name}/${filter}?access_token=${accessToken}`
    //         )
    //         .set("Accept", "application/json")
    //         .expect(200)
    //         .expect("Content-Type", /json/)
    //         .end(function(err, res) {
    //             if (err) {
    //                 return done(err);
    //             }
    //             res.body.should.have.property("id").and.be.string;
    //             res.body.should.have.property("name").and.equal(name);
    //             res.body.should.have
    //                 .property("messages")
    //                 .and.be.instanceof(Array);
    //             done();
    //         });
    // });
});

// function postTestRoom() {
//     let testRoom = {
//         canonicalAlias: "#string:server.name",
//         name: "string",
//         worldReadable: false,
//         topic: "Testing",
//         numberOfJoinedMembers: 0,
//         federate: false,
//         roomId: "!hash:server.name",
//         guestCanJoin: false,
//         aliases: ["#string:server.name"]
//     };

//     return superagent
//         .post(scichatBaseUrl + "/Rooms")
//         .send(testRoom)
//         .then(res => {
//             return Promise.resolve(res.body);
//         })
//         .catch(err => {
//             console.error(err);
//         });
// }

// function postTestMessage(id) {
//     let testMessage = {
//         timestamp: new Date(),
//         sender: "@user:server.name",
//         eventId: "$hash",
//         unsigned: {},
//         content: {
//             body: "Test message",
//             msgtype: "m.text"
//         },
//         type: "m.room.message"
//     };

//     return superagent
//         .post(scichatBaseUrl + `/Rooms/${id}/messages`)
//         .send(testMessage)
//         .then(res => {
//             return Promise.resolve(res.body);
//         })
//         .catch(err => {
//             console.error(err);
//         });
// }

// function deleteTestRoom(id) {
//     return superagent
//         .delete(scichatBaseUrl + `/Rooms/${id}`)
//         .then(res => {
//             return Promise.resolve(res);
//         })
//         .catch(err => {
//             console.error(err);
//         });
// }

// function deleteTestMessage(roomId) {
//     return superagent
//         .delete(scichatBaseUrl + `/Rooms/${roomId}/messages`)
//         .then(res => {
//             return Promise.resolve(res.body);
//         })
//         .catch(err => {
//             console.error(err);
//         });
// }
