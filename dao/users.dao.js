let express = require('express');
let log4js = require("log4js");
let UserModel = require('../models/users.model');
const logger = log4js.getLogger("Users Dao");

module.exports = {
    insertOne : insertOne,
    findOne : findOne,
    find : find
};

async function insertOne(userDetails) {
    let userData = new UserModel(userDetails);
    let newUser = await userData.save().catch((err) => {
        return err;
    });
    return newUser;
}

async function findOne(query) {
    let userDetails = await UserModel.findOne(query).catch((err) => {
        return err;
    });
    return userDetails;
}

async function find(query) {
    let userList = await UserModel.find(query).catch((err) => {
        return err;
    });
    return userList;
}
