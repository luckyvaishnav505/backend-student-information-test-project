let jwt = require('jsonwebtoken');
const config = require('config');

module.exports = {
    createToken : createToken
};

function createToken(userDetails) {
    let secrete_key = config.get('token.secret');
    let audience_key = config.get('token.audience');
    let issuer_key = config.get('token.issuer');
    let token = jwt.sign({
        userId: userDetails._id,
        username: userDetails.username,
        email : userDetails.email,
        aud : audience_key,
        iss : issuer_key,
        alg : 'HS256',
        jti : userDetails._id,
        mobileNumber : userDetails.mobileNumber
      }, secrete_key, { expiresIn: "1h" });
    return token; 
}

