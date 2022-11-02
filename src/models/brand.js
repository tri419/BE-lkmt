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

class Brand extends Base {
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
    this.status = undefined;
  }
  static fromMongo(input) {
    if (input == null || input instanceof mongoose.Types.ObjectId) {
      return null;
    }
    const output = new Product();
    if (input != null) {
      output.brand = input.brand;
      output.uid = input.uid;
      output.code = input.code;
      output.name = input.name;
      output.nameUnsigned = input.nameUnsigned;
      output.status = input.status;
      output.createdAt = input.createdAt;
      output.updatedAt = input.updatedAt;
    }
    return output;
  }
  static toMongo(input) {
    // eslint-disable-next-line no-unused-vars
    const { includedFields, ...Product } = input;
    return Product;
  }
  static fromRequest(input) {
    const output = {};
    if (input != null) {
      output.uid = Utils.getString(input.uid, '');
      output.code = Utils.getString(input.code, '');
      output.name = Utils.getString(input.name, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(input.name), '');
      output.status = Utils.getBoolean(input.status, true);
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    output.name = output.name.trim().replace(/\s\s+/g, ' ');
    output.nameUnsigned = output.nameUnsigned.trim().replace(/\s\s+/g, ' ');
    return output;
  }
}
module.exports = Brand;
