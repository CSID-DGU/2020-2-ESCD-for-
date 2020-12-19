const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = {
  encryptPassword: (plainPassword) => {
    return bcrypt.hash(plainPassword, saltRounds);
  },
  verifyPassword: (plainPassword, encryptedPassword) => {
    return bcrypt.compare(plainPassword, encryptedPassword);
  },
};
