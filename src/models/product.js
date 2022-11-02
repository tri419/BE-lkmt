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

class Product extends Base {
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
    /** @type {String} */
    this.expiryDate = undefined;
    /** @type {String} */
    this.productType = undefined;
    /** @type {String} */
    this.brand = undefined;
    /** @type {Array} */
    this.descriptionDetail = undefined;
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
      output.price = input.price;
      output.status = input.status;
      output.discount = input.discount;
      output.discountPrice = input.discountPrice;
      output.expiryDate = input.expiryDate;
      output.productType = input.productType;
      output.brand = input.brand;
      output.image = input.image;
      output.descriptionSummary = input.descriptionSummary;
      output.descriptionDetail = input.descriptionDetail;
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
    const output = new Product();
    if (input != null) {
      output.uid = Utils.getString(input.uid, '');
      output.brand = Utils.getString(input.brand, '');
      output.code = Utils.getString(input.code, '');
      output.name = Utils.getString(input.name, '');
      output.productType = Utils.getString(input.productType, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(input.name), '');
      output.price = Utils.getInteger(input.price, '');
      output.status = Utils.getBoolean(input.status, true);
      output.discount = Utils.getInteger(input.discount, '');
      output.discountPrice = Utils.getInteger(input.discountPrice, '');
      output.expiryDate = Utils.getInteger(input.expiryDate, 0);
      output.descriptionSummary = Utils.getString(input.descriptionSummary, '');
      output.descriptionDetail = Utils.getArray(input.descriptionDetail, []);
      output.image = Utils.getArray(input.image, []);
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    output.name = output.name.trim().replace(/\s\s+/g, ' ');
    output.nameUnsigned = output.nameUnsigned.trim().replace(/\s\s+/g, ' ');
    return output;
  }
  static fromUpdateProduct(input) {
    const output = {};
    if (input != null) {
      output.brand = Utils.getString(input.brand, '');
      output.code = Utils.getString(input.code, '');
      output.name = Utils.getString(input.name, '');
      output.productType = Utils.getString(input.productType, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(input.name), '');
      output.price = Utils.getInteger(input.price, '');
      output.status = Utils.getBoolean(input.status, true);
      output.discount = Utils.getInteger(input.discount, '');
      output.discountPrice = Utils.getInteger(input.discountPrice, '');
      output.expiryDate = Utils.getInteger(input.expiryDate, 0);
      output.descriptionSummary = Utils.getString(input.descriptionSummary, '');
      output.descriptionDetail = Utils.getArray(input.descriptionDetail, []);
      output.image = Utils.getArray(input.image, []);
    }
    return output;
  }
}
module.exports = Product;
