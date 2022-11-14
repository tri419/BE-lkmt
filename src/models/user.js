'use strict';
/**
 * @typedef {import("mongoose").Document} Document
 */
const mongoose = require('mongoose');
const Base = require('./base');
const { ulid } = require('ulid');
const { Utils } = require('../libs/utils');
const { ERROR, ACTIONS } = require('../constants');
const ErrorModel = require('./error');

class User extends Base {
  constructor() {
    super();
    /** @type {String} */
    this.uid = undefined;
    /** @type {String} */
    this.code = undefined;
    /** @type {String} */
    this.name = undefined;
    /** @type {String} */
    this.nameUnsigned = undefined;
    /** @type {String} */
    this.username = undefined;
    /** @type {String} */
    this.password = undefined;
    /** @type {String} */
    this.email = undefined;
    /** @type {String} */
    this.phone = undefined;
    /** @type {String} */
    this.roleId = undefined;
    /** @type {String} */
    this.status = undefined;
    /** @type {String} */
    this.avatar = undefined;
  }
  static fromMongo(input) {
    if (input == null || input instanceof mongoose.Types.ObjectId) {
      return null;
    }
    const output = new User();
    if (input != null) {
      output.uid = input.uid;
      output.code = input.code;
      output.name = input.name;
      output.nameUnsigned = input.nameUnsigned;
      output.username = input.username;
      output.password = input.password;
      output.email = input.email;
      output.phone = input.phone;
      output.roleId = input.roleId;
      output.status = input.status;
      output.avatar = input.avatar;
      output.createdAt = input.createdAt;
      output.updatedAt = input.updatedAt;
    }
    return output;
  }
  static toMongo(input) {
    // eslint-disable-next-line no-unused-vars
    const { includedFields, ...User } = input;
    return User;
  }
  static fromRequest(input) {
    const output = {};
    if (input != null) {
      output.code = Utils.getString(input.code, '');
      output.name = Utils.getString(input.name, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(input.name), '');
      output.username = Utils.getString(input.username, '');
      output.password = Utils.getString(input.password, '');
      output.email = Utils.getString(input.email, '');
      output.phone = Utils.getString(input.phone, '');
      output.roleId = Utils.getString(input.roleId, '');
      output.status = Utils.getBoolean(input.status, false);
      output.avatar = Utils.getString(input.avatar, '');
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    output.email = output.email.toLowerCase();
    output.name = output.name.trim().replace(/\s\s+/g, ' ');
    output.nameUnsigned = output.nameUnsigned.trim().replace(/\s\s+/g, ' ');
    return output;
  }
  static fromUpdateUser(input) {
    const output = {};
    if (input != null) {
      output.name = Utils.getString(input.name, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(input.name), '');
      output.username = Utils.getString(input.username, '');
      output.password = Utils.getString(input.password, '');
      output.email = Utils.getString(input.email, '');
      output.phone = Utils.getInteger(input.phone, '');
      output.roleId = Utils.getString(input.roleId, '');
      output.status = Utils.getBoolean(input.status, false);
      output.avatar = Utils.getString(input.avatar, '');
    }
    return output;
  }
  static updatePassword(input) {
    const output = {};
    if (input != null) {
      output.password = Utils.getString(input.password, '');
    }
    return output;
  }
  static updateStatusUser(input) {
    const output = {};
    if (input != null) {
      output.status = Utils.getBoolean(input.status, false);
    }
    return output;
  }
}
module.exports = User;
