/* jshint node:true */
/* jshint esversion:6 */
'use strict';

// process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var app = require('../server/server');
var should = chai.should();
var utils = require('./LoginUtils');

var accessToken = null;

describe('Datablocks', () => {
    beforeEach((done) => {
        utils.getToken(app, {'username': 'ingestor', 'password': 'aman'},
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });
    describe('Get All Datablocks', function () {
        it('fetches array of Datablocks', function (done) {
            request(app)
                .get('/api/v2/Datablocks?filter=%7B%22limit%22%3A10%7D&access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    res.body.should.be.instanceof(Array);
                    console.log(res.body[0]);
                    done();
                });
        });
    });
});
