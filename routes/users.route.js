let express = require('express');
let router = express.Router();
let log4js = require("log4js");
const config = require('config');
let jwt = require('express-jwt');
const logger = log4js.getLogger("Users Routes");
let usersInterceptor = require('../interceptors/users.interceptor');
let usersController = require('../controllers/users.controller');

logger.debug("Users Routes Initiated");

let secrete_key = config.get('token.secret');
let audience_key = config.get('token.audience');
let issuer_key = config.get('token.issuer');

let jwtCheck = jwt({
    secret: secrete_key,
    audience: audience_key,
    issuer: issuer_key,
    algorithms: [ 'HS256' ]
  });

//router.post('/', usersInterceptor.createUser, usersController.createUser);

router.post('/login', usersInterceptor.loginUser, usersController.loginUser);
router.post('/register1', usersController.createUser);
router.post('/updateUser', usersController.updateUser);
router.post('/removeUser', usersController.removeUser);
router.post('/search', usersController.searchUser);
router.get('/list',  usersController.listUsers);

module.exports = router;
