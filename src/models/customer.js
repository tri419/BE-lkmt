'use strict';
/**
 * @typedef {import("mongoose").Document} Document
 */
const mongoose = require('mongoose');
const Base = require('./base');
const { Utils } = require('../libs/utils');
const { ERROR, ACTIONS } = require('../constants');
const ErrorModel = require('./error');

class Customer extends Base {
  constructor() {
    super();
    this.uid = undefined;
    /** @type {String} */
    this.code = undefined;
    /** @type {String} */
    this.name = undefined;
    /** @type {String} */
    this.nameUnsigned = undefined;
    /** @type {String} */
    this.status = undefined;
    /** @type {String} */
    this.username = undefined;
    /** @type {String} */
    this.password = undefined;
    /** @type {String} */
    this.firstName = undefined;
    /** @type {String} */
    this.lastName = undefined;
    /** @type {String} */
    this.dateOfBirth = undefined;
    /** @type {String} */
    this.sex = undefined;
    /** @type {String} */
    this.phone = undefined;
    /** @type {String} */
    this.email = undefined;
    /** @type {String} */
    this.status = undefined;
    /** @type {Boolean} */
    this.avatar = undefined;
    /** @type {String} */
    this.roleId = undefined;
    /** @type {String} */
    this.address = undefined;
    /** @type {Array} */
  }
  static fromMongo(input) {
    if (input == null || input instanceof mongoose.Types.ObjectId) {
      return null;
    }
    const output = new Customer();
    if (input != null) {
      output.uid = input.uid;
      output.code = input.code;
      output.name = input.name;
      output.nameUnsigned = input.nameUnsigned;
      output.username = input.username;
      output.password = input.password;
      output.firstName = input.firstName;
      output.lastName = input.lastName;
      output.dateOfBirth = input.dateOfBirth;
      output.sex = input.sex;
      output.phone = input.phone;
      output.email = input.email;
      output.status = input.status;
      output.avatar = input.avatar;
      output.resetPasswordToken = input.resetPasswordToken;
      output.resetPasswordExpires = input.resetPasswordExpires;
      output.address = input.address;
      output.createdAt = input.createdAt;
      output.updatedAt = input.updatedAt;
    }
    return output;
  }
  static toMongo(input) {
    // eslint-disable-next-line no-unused-vars
    const { includedFields, ...Customer } = input;
    return Customer;
  }
  static fromRequest(input) {
    const output = new Customer();
    if (input != null) {
      output.uid = Utils.getString(input.uid, '');
      output.code = Utils.getString(input.code, '');
      output.name = Utils.getString(input.firstName + ' ' + input.lastName, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(output.name), '');
      output.username = Utils.getString(input.username, '');
      output.password = Utils.getString(input.password, '');
      output.firstName = Utils.getString(input.firstName, '');
      output.lastName = Utils.getString(input.lastName, '');
      output.dateOfBirth = Utils.getDateFromString(input.dateOfBirth);
      output.sex = Utils.getString(input.sex, 'Male');
      output.phone = Utils.getString(input.phone, '');
      output.email = Utils.getString(input.email, '');
      output.status = Utils.getBoolean(input.status, true);
      output.avatar = Utils.getString(input.avatar, '');
      output.resetPasswordToken = Utils.getString(input.resetPasswordToken, '');
      output.resetPasswordExpires = Utils.getString(
        input.resetPasswordToken,
        '',
      );
      output.address = [
        {
          street: Utils.getString(input.street, ''),
          province: Utils.getString(input.province, ''),
          district: Utils.getString(input.district, ''),
          ward: Utils.getString(input.ward, ''),
          status: true,
        },
      ];
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    output.email = output.email.toLowerCase();
    output.name = output.name.trim().replace(/\s\s+/g, ' ');
    output.nameUnsigned = output.nameUnsigned.trim().replace(/\s\s+/g, ' ');
    output.firstName = output.firstName.trim().replace(/\s\s+/g, ' ');
    output.lastName = output.lastName.trim().replace(/\s\s+/g, ' ');
    return output;
  }
  static fromUpdateCustomer(input) {
    const output = {};
    if (input != null) {
      output.name = Utils.getString(input.firstName + ' ' + input.lastName, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(output.name), '');
      output.username = Utils.getString(input.username, '');
      output.firstName = Utils.getString(input.firstName, '');
      output.lastName = Utils.getString(input.lastName, '');
      output.dateOfBirth = Utils.getDateFromString(input.dateOfBirth);
      output.sex = Utils.getString(input.sex, 'Male');
      output.phone = Utils.getString(input.phone, '');
      output.email = Utils.getString(input.email, '');
      output.status = Utils.getBoolean(input.status, true);
      output.avatar = Utils.getString(input.avatar, '');
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    output.email = output.email.toLowerCase();
    output.name = output.name.trim().replace(/\s\s+/g, ' ');
    output.nameUnsigned = output.nameUnsigned.trim().replace(/\s\s+/g, ' ');
    output.firstName = output.firstName.trim().replace(/\s\s+/g, ' ');
    output.lastName = output.lastName.trim().replace(/\s\s+/g, ' ');
    return output;
  }
  static fromUpdateStatusCustomer(input) {
    const output = {};
    if (input != null) {
      output.status = Utils.getBoolean(input.status, false);
    }
    return output;
  }
  static searchCustomer(input) {
    const output = {};
    output.code = !input.code ? null : input.code.trim();
    output.name = !input.name
      ? null
      : Utils.tvkd(input.name.trim().replace(/\s\s+/g, ' '));
    output.status = !input.status ? null : input.status.trim();
    output.limit = input.limit || '10';
    output.limit = Number.parseInt(output.limit, 10);
    output.page = input.page || '1';
    output.page = Number.parseInt(output.page, 10);
    if (Number.isNaN(output.page) || Number.isNaN(output.limit)) {
      output.limit = 100;
      output.page = 1;
    }
    return output;
  }
  static login(input) {
    const output = {};
    if (input != null) {
      output.username = Utils.getString(input.username, '');
      output.password = Utils.getString(input.password, '');
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    output.username = output.username.trim().replace(/\s+/g, '');
    return output;
  }
  static forgotPassword(input) {
    const output = {};
    if (input != null) {
      output.email = Utils.getString(input.email, '');
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    return output;
  }
  static fromPasswordToken(input) {
    const output = {};
    if (input != null) {
      output.password = Utils.getString(input.password, '');
    }
    return output;
  }
  static fromAddress(input) {
    const output = {};
    if (input != null) {
      output.address = Utils.getArray(input.address, []);
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    return output;
  }
}
module.exports = Customer;
