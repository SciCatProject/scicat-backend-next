/* jshint node:true */
/* jshint esversion:6 */
'use strict';

// process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const should = chai.should();
const utils = require('./LoginUtils');

let accessToken = null,
    defaultProposalId = null,
    proposalId = null,
    attachmentId= null;

const testproposal = {
    "proposalId": "20170266",
    "email": "proposer%40uni.edu",
    "title": "A test proposal",
    "abstract": "Abstract of test proposal",
    "ownerGroup": "20170251-group"

}

var app
before( function(){
    app = require('../server/server')
});

describe('Simple Proposal tests', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'proposalIngestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });

    // the following two function definition prepare for
    // multi-delete actions to finish
    async function deleteProposal(item) {
        await request(app)
            .delete('/api/v3/Proposals/' + item.proposalId + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
    }

    async function processArray(array) {
        for (const item of array) {
            await deleteProposal(item)
        }
        // console.log("==== Finishing all deletes")
    }

    it('remove potentially existing proposals to guarantee uniqueness', function(done) {
        let filter = '{"where": {"proposalId": "' + testproposal.proposalId + '"}}'
        // console.log("Filter expression before encoding:",filter)
        let url = '/api/v3/Proposals?filter=' + encodeURIComponent(filter) + '&access_token=' + accessToken
        // console.log("============= url of query: ", url)
        request(app)
            .get(url)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                //console.log(" ==================== Found existing proposals:", res.body)
                // now remove all these entries
                processArray(res.body)
                done()
            });
    });

    it('adds a new proposal', function(done) {
        request(app)
            .post('/api/v3/Proposals?access_token=' + accessToken)
            .send(testproposal)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('ownerGroup').and.be.string;
                res.body.should.have.property('proposalId').and.be.string;
                defaultProposalId = res.body['proposalId'];
                proposalId = encodeURIComponent(res.body['proposalId']);
                done();
            });
    });

    it('should fetch this new proposal', function(done) {
        request(app)
            .get('/api/v3/Proposals/' + proposalId + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it("should add a new attachment to this proposal", function(done) {
        const testAttachment = {
            "thumbnail": "data/abc123",
            "caption": "Some caption",
            "creationTime": new Date(),
            "proposalId": defaultProposalId
        };
        request(app)
            .post(
                "/api/v3/Proposals/" +
                    proposalId +
                    "/attachments?access_token=" +
                    accessToken
            )
            .send(testAttachment)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.have.property("thumbnail").and.equal(testAttachment.thumbnail);
                res.body.should.have.property("caption").and.equal(testAttachment.caption);
                res.body.should.have.property("creationTime");
                res.body.should.have.property("id").and.be.string;
                res.body.should.have.property("proposalId").and.equal(testAttachment.proposalId);
                attachmentId = encodeURIComponent(res.body["id"]);
                done();
            });
    });

    it("should fetch this proposal attachment", function(done) {
        request(app)
            .get(
                "/api/v3/Proposals/" +
                    proposalId +
                    "/attachments/" +
                    attachmentId +
                    "?access_token=" +
                    accessToken
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("should delete this proposal attachment", function(done) {
        request(app)
            .delete(
                "/api/v3/Proposals/" +
                    proposalId +
                    "/attachments/" +
                    attachmentId +
                    "?access_token=" +
                    accessToken
            )
            .set("Accept", "application/json")
            .expect(204)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it('should delete this proposal', function(done) {
        request(app)
            .delete('/api/v3/Proposals/' + proposalId + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });


});
