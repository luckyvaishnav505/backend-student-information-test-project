let express = require('express');
const config = require('config');
let log4js = require("log4js");
const bcrypt = require('bcrypt');
let mailService = require('./mail.service');
let tokenService = require('./token.service');
let usersDao = require('../dao/users.dao');
const logger = log4js.getLogger("Users Service");
logger.debug("Banner Service Initiated");
let UserModel = require('../models/users.model');

module.exports = {
    createUser : createUser,
    loginUser: loginUser,
    removeUser : removeUser,
    listUsers : listUsers,
    updateUser:updateUser,
    serachUser : serachUser
};

async function serachUser(req, callback) {

  var lookupInput = req.body.key;
  lookupInput = lookupInput.replace(/[*+?()\[\]\\|^&<>]/g, " ");
  lookupInput = lookupInput.replace(/[+]/g, "\\+");
  
  var searchArray = [];
  var result = [];
  searchArray.push({ firstName: { '$regex': new RegExp('^' + lookupInput, "i") } });
  searchArray.push({ lastName: { '$regex': new RegExp('^' + lookupInput, "i")} });
  searchArray.push({ email: { '$regex': new RegExp('^' + lookupInput, "i")} });
  //searchArray.push({ mobileNumber: { '$regex': new RegExp('^' + lookupInput, "i")} });
  var searchQuery = { $or: searchArray };
     let data =  await  UserModel.find(searchQuery).
      sort({mailboxName: 1}).
      skip(req.body.skip).
      limit(10);

  
  if(data && data.length >0) {
    let count =  await  UserModel.find(searchQuery).count();
        callback(null,{ allUsers:data ,totalusers:count});
  } else {
        callback(null,{ allUsers:[] ,totalusers:0});
  }
}
async function createUser(userDetails, callback) {
  logger.debug('Initiated createUser');
  userDetails.password = encryptPassword(userDetails.password);
  logger.debug('Hash password : '+userDetails.password);
  let newUserDetails = await usersDao.insertOne(userDetails);
  if(newUserDetails && newUserDetails._id) {
    logger.debug('User created successfully : '+newUserDetails._id);
    callback(null, newUserDetails);
  } else {
    logger.error('Failed to create user : ');
    logger.error(newUserDetails);
    callback(newUserDetails, null);
  }
}
async function loginUser(credentials, callback) {
  logger.debug('Initiated login User');
  let findUserQuery = { username : credentials.username };
  let userDetails = await usersDao.findOne(findUserQuery);
  if(userDetails && userDetails._id) {
     let isPasswordMatched = comparePassword(credentials.password, userDetails.password);
      if(isPasswordMatched) {
        logger.debug('User login successful : '+credentials.username);
        delete userDetails.password;
        let token = tokenService.createToken(userDetails);
        let response = {
          token : token,
          user : userDetails
        };
        callback(null, response);
     } else {
        logger.error('User login Failed : '+credentials.username);
        let error = new Error();
        error.message = "Invalid Credentials";
        callback(error, null);
     }
  } else {
    logger.error('User login Failed : '+credentials.username);
    let error = new Error();
    error.message = "Invalid Credentials";
    callback(error, null);
  }
}

async function listUsers(req, callback) {
  logger.debug('Initiated List all Users for Admin'+ req.query.skip);
  let skip = parseInt(req.query.skip);
  let allUsers = await  UserModel.aggregate([{$skip:skip}, {$limit:10} , {$sort:{'firstName':-1}}]);
  let totalusers = await  UserModel.find({}).count();
  if(allUsers && allUsers.length > -1) {
    logger.debug('User list fetched successfully : '+allUsers.length);
    callback(null, {allUsers :allUsers, totalusers:totalusers});
  } else {
    logger.error('Failed to fetch all users : ');
    logger.error(allUsers);
    callback(allUsers, null);
  }
}
async function removeUser(req, callback) {
  logger.debug('Initiated List all Users for Admin');
  let data  = await UserModel.remove({_id :req});
       callback(null, {msg :"user remove successfully"});
 
}
async function updateUser(req, callback) {
  logger.debug('updateUser----------');
  let data  = await UserModel.update({_id :req.Id}, {$set:{"firstName":req.firstName ,"lastName":req.lastName, 
  "username":req.username,"mobileNumber":req.mobileNumber}});
       callback(null, {msg :"user updated successfully"});
 
}
function encryptPassword(plainTextPassword) {
  let saltRounds = config.get('saltRounds');
  const hashPassword = bcrypt.hashSync(plainTextPassword, saltRounds);
  return hashPassword;
}

function comparePassword(plainTextPassword, hashPassword) {
  let isPasswordCorrect = bcrypt.compareSync(plainTextPassword, hashPassword);
  return isPasswordCorrect;
}

