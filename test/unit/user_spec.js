/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'todo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');
var traceur = require('traceur');

var User;
var sue;

describe('User', function(){
  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      User = traceur.require(__dirname + '/../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      User.register({email:'sue@aol.com', password:'abcd'}, function(u){
        sue = u;
        done();
      });
    });
  });


  describe('.register', function(){
    it('should successfully register a user', function(done){
      User.register({email:'bob@aol.com', password:'1234'}, function(u){
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceof(User);
        expect(u._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(u.password).to.have.length(60);
        done();
      });
    });

    it('should NOT successfully register a user', function(done){
      User.register({email:'sue@aol.com', password:'does not matter'}, function(u){
        expect(u).to.be.null;
        done();
      });
    });
  });

  describe('.login', function(){
    it('should successfully login a user', function(done){
      User.login({email:'sue@aol.com', password:'abcd'}, function(u){
        expect(u).to.be.ok;
        done();
      });
    });

    it('should NOT login user - bad email', function(done){
      User.login({email:'wrong@aol.com', password:'abcd'}, function(u){
        expect(u).to.be.null;
        done();
      });
    });

    it('should NOT login user - bad password', function(done){
      User.login({email:'sue@aol.com', password:'wrong'}, function(u){
        expect(u).to.be.null;
        done();
      });
    });

    describe('.findById', function(){
      it('should find a user by _id', function(done){
        var userId = sue._id.toString();
        User.findById(userId, function(u){
          expect(u).to.be.ok;
          expect(u.email).to.equal(sue.email);
          expect(u).to.be.an.instanceof(User);
          done();
        });
      });

      it('should NOT successfully find user', function(done){
        User.findById('not an id', function(u){
          expect(u).to.be.null;
          done();
        });
      });
    });
  });

});
