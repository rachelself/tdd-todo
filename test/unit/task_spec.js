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
var Task;
var sue;
var bob;
var task;
var task2;
var u2Task3;

describe('Task', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      Task = traceur.require(__dirname + '/../../app/models/task.js');
      User = traceur.require(__dirname + '/../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('tasks').drop(function(){
      global.nss.db.collection('users').drop(function(){
        User.register({email:'sue@aol.com', password:'abcd'}, function(u1){
          User.register({email:'bob@aol.com', password:'abcd'}, function(u2){
            Task.create(u1._id, {title:'homework', due:'Tue Jun 03 2014 10:36:46 GMT-0500 (CDT)', color:'blue'}, function(t1){
              Task.create(u1._id, {title:'bank', due:'Wed Jun 04 2014 10:36:46 GMT-0500 (CDT)', color:'red'}, function(t2){
                Task.create(u2._id, {title:'groceries', due:'Tue Jun 03 2014 10:36:46 GMT-0500 (CDT)', color:'green'}, function(t3){
                  task = t1;
                  task2 = t2;
                  u2Task3 = t3;
                  sue = u1;
                  bob = u2;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should successfully create a new task', function(done){
      var body = {};
      body.title = 'groceries';
      body.due = 'Tue Jun 03 2014 10:36:46 GMT-0500 (CDT)';
      body.color = 'lavender';
      Task.create(sue._id, body, function(t){
        expect(t._id).to.be.ok;
        expect(t).to.be.an.instanceof(Task);
        expect(t.userId).to.be.an.instanceof(Mongo.ObjectID);
        expect(t.due).to.be.an.instanceof(Date);
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should successfully find task by its id', function(done){
      Task.findById(task._id.toString(), function(t){
        expect(t).to.be.an.instanceof(Task);
        expect(t._id).to.deep.equal(task._id);
        done();
      });
    });

    it('should NOT find a task - BAD ID', function(done){
      Task.findById('not an id', function(t){
        expect(t).to.be.null;
        done();
      });
    });

    it('should NOT find a task - WRONG ID', function(done){
      Task.findById('538dfb6e5cc8b9f1069585b2', function(t){
        expect(t).to.be.null;
        done();
      });
    });
  });

  describe('.findByUserId', function(){
    it('should find the tasks associated with a user id', function(done){
      Task.findByUserId(sue._id.toString(), function(tasks){
        expect(tasks.length).to.equal(2);
        expect(tasks[0].userId.toString()).to.deep.equal(sue._id.toString());
        expect(tasks[1].userId.toString()).to.deep.equal(sue._id.toString());
        done();
      });
    });

    it('should NOT find any tasks - wrong userId', function(done){
      Task.findByUserId('538dfb6e5cc8b9f1069585b2', function(tasks){
        expect(tasks).to.have.length(0);
        done();
      });
    });

    it('should NOT find any tasks - bad userId', function(done){
      Task.findByUserId('not an id', function(tasks){
        expect(tasks).to.be.null;
        done();
      });
    });
  });

  describe('#destroy', function(){
    it('should delete task', function(done){
      task2.destroy(function(){
        Task.findByUserId(sue._id.toString(), function(tasks){
          expect(tasks).to.have.length(1);
          done();
        });
      });
    });
  });

  describe('#toggleComplete', function(){
    it('should toggle a task', function(){
      task.toggleComplete();
      expect(task.isComplete).to.be.true;
    });
  });

  describe('#save', function(){
    it('should save a task', function(done){
      task.toggleComplete();
      task.save(function(){
        Task.findById(task._id.toString(), function(foundTask){
          expect(foundTask.isComplete).to.be.true;
          done();
        });
      });
    });
  });

  describe('#edit', function(){
    it('should edit a task', function(done){
      task.edit({title:'groceries', due:'Tue Jun 03 2014 10:36:46 GMT-0500 (CDT)', color:'green'});
      expect(task.title).to.equal('groceries');
      expect(task.due).to.be.an.instanceof(Date);
      expect(task.color).to.equal('green');
      done();
    });
  });
});
