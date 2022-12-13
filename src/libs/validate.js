const googleBibphonenumber = require('google-libphonenumber');
const emailValidator = require('email-validator');

class Validate {
  constructor() {}
  static phone(number) {
    const phoneUtil = googleBibphonenumber.PhoneNumberUtil.getInstance();
    const country = process.env.COUNTRY || 'VN';
    const pare = phoneUtil.parseAndKeepRawInput(number, country);
    const ret = phoneUtil.isValidNumberForRegion(pare, country);
    return ret;
  }
  static email(email) {
    const ret = emailValidator.validate(email);
    return ret;
  }
}
module.exports = { Validate: Validate };
