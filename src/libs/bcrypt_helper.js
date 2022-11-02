const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

const hashText = (text) => {
  let hash = '';
  if (text) {
    hash = cryptr.encrypt(text);
  }
  return hash;
};
const compareTwoText = (text, hash) => {
  // return bcrypt.compareSync(text, hash); // true
  let output = false;
  const HashToText = cryptr.decrypt(hash);
  if (HashToText == text) {
    output = true;
  }
  return output;
};
const HashToText = (hash) => {
  return cryptr.decrypt(hash);
};
module.exports = {
  hashText,
  compareTwoText,
  HashToText,
};
