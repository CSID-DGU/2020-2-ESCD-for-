const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

function generateJWT(payload) {
  const options = {
    expiresIn: '1d',
  };
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, options, function (err, token) {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
}

module.exports = { generateJWT };
