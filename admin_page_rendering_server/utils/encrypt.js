const bcrypt = require("bcrypt");

const saltRounds = 10;

module.exports = {
  encryption: (plainText) => {
    return bcrypt.hash(plainText, saltRounds);
  },
  compare: (plainText, encryptedText) => {
    return bcrypt.compare(plainText, encryptedText);
  },
};
