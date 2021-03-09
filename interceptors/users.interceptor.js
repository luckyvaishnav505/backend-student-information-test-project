
module.exports = {
    createUser : createUser,
    loginUser : loginUser
};

function createUser(req, res, next) {
    let username = req.body.username;
    if(username && username !== '') {
        next();
    } else {
        res.send({"message" : "Required field/s missing."});
    }
}

function loginUser(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    if(username && username !== '' && password && password !== '') {
        next();
    } else {
        res.send({"message" : "Required field/s missing."});
    }
}
