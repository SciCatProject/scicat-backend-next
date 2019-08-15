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
    defaultSampleId = null,
    sampleId = null,
    attachmentId= null;

const testSample = {
    "owner": "string",
    "description": "string",
    "createdAt": new Date(),
    "sampleCharacteristics": {},
    "ownerGroup": "string",
    "accessGroups": [
      "string"
    ],
    "createdBy": "string",
    "updatedBy": "string",
    "updatedAt": new Date()
  }

var app
before( function(){
    app = require('../server/server')
});

describe('Simple Sample tests', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });

    it('adds a new sample', function(done) {
        request(app)
            .post('/api/v3/Samples?access_token=' + accessToken)
            .send(testSample)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('owner').and.be.string;
                res.body.should.have.property('sampleId').and.be.string;
                defaultSampleId = res.body['sampleId'];
                sampleId = encodeURIComponent(res.body['sampleId']);
                done();
            });
    });

    it('should fetch this new sample', function(done) {
        request(app)
            .get('/api/v3/Samples/' + sampleId + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it("should add a new attachment to this sample", function(done) {
        const testAttachment = {
            "thumbnail": "data/abc123",
            "caption": "Some caption",
            "creationTime": new Date(),
            "sampleId": defaultSampleId
        };
        request(app)
            .post(
                "/api/v3/Samples/" +
                    sampleId +
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
                res.body.should.have.property("sampleId").and.equal(testAttachment.sampleId);
                attachmentId = encodeURIComponent(res.body["id"]);
                done();
            });
    });

    it("should fetch this sample attachment", function(done) {
        request(app)
            .get(
                "/api/v3/Samples/" +
                    sampleId +
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

    it("should delete this sample attachment", function(done) {
        request(app)
            .delete(
                "/api/v3/Samples/" +
                    sampleId +
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

    it('should delete this sample', function(done) {
        request(app)
            .delete('/api/v3/Samples/' + sampleId + '?access_token=' + accessToken)
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
