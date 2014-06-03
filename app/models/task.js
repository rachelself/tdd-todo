'use strict';

var taskCollection = global.nss.db.collection('tasks');
var Mongo = require('mongodb');
var _ = require('lodash');

class Task{

  destroy(fn){
    taskCollection.findAndRemove({_id:this._id}, ()=>{
      fn();
    });
  }

  toggleComplete(){
    this.isComplete = !this.isComplete;
  }

  save(fn){
    taskCollection.save(this, ()=>{fn();});
  }

  edit(obj){
    this.title = obj.title;
    this.due = new Date(obj.due);
    this.color = obj.color;
  }

  static create(userId, body, fn){
    if(typeof userId === 'string'){userId = Mongo.ObjectID(userId);}

    var task = new Task();
    task.title = body.title;
    task.due = new Date(body.due);
    task.color = body.color;
    task.userId = userId;
    task.isComplete = false;
    taskCollection.save(task, (err, t)=>{
      fn(t);
    });
  }

  static findById(userId, fn){
    if(userId.length !== 24){fn(null); return;}

    userId = Mongo.ObjectID(userId);
    taskCollection.findOne({_id:userId}, (err, task)=>{
      if(task){
        task = _.create(Task.prototype, task);
        fn(task);
      }else{
        fn(null);
      }
    });
  }

  static findByUserId(userId, fn){
    if(userId.length !== 24){fn(null); return;}
    if(typeof userId === 'string'){userId = Mongo.ObjectID(userId);}

    taskCollection.find({userId:userId}).toArray((err, tasks)=>{
      fn(tasks);
    });
  }

}

module.exports = Task;
