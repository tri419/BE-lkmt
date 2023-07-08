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
    /** @type {Array} */
    this.image = undefined;
    /** @type {Array} */
    this.customerComment = undefined;
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
      output.quantity = input.quantity;
      output.createdAt = input.createdAt;
      output.updatedAt = input.updatedAt;
      output.customerComment = input.customerComment;
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
      output.brand = Utils.getString(input.brand, '');
      output.code = Utils.getString(input.code, '');
      output.name = Utils.getString(input.name, '');
      output.productType = Utils.getString(input.productType, '');
      output.nameUnsigned = Utils.getString(Utils.tvkd(input.name), '');
      output.price = Utils.getInteger(input.price, 0);
      output.status = Utils.getBoolean(input.status, true);
      output.discount = Utils.getInteger(input.discount, 0);
      output.discountPrice = Utils.getInteger(input.discountPrice, 0);
      output.expiryDate = Utils.getInteger(input.expiryDate, 0);
      output.descriptionSummary = Utils.getString(input.descriptionSummary, '');
      output.descriptionDetail = Utils.getArray(input.descriptionDetail, []);
      output.image = Utils.getArray(input.image, []);
      output.customerComment = Utils.getArray(input.customerComment, []);
      output.quantity = Utils.getInteger(input.quantity, 0);
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
      //output.code = Utils.getString(input.code, '');
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
      output.quantity = Utils.getInteger(input.quantity, '');
    }
    return output;
  }
  static fromUpdateStatusProduct(input) {
    const output = {};
    if (input != null) {
      output.status = Utils.getBoolean(input.status, false);
    }
    return output;
  }
  static searchProduct(input) {
    const output = {};
    output.code = !input.code ? null : input.code.trim();
    output.name = !input.name
      ? null
      : Utils.tvkd(input.name.trim().replace(/\s\s+/g, ' '));
    output.productType = !input.productType
      ? null
      : Utils.tvkd(input.productType.trim().replace(/\s\s+/g, ' '));
    output.brand = !input.brand
      ? null
      : Utils.tvkd(input.brand.trim().replace(/\s\s+/g, ' '));
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
  static fromCustomerComment(input) {
    const output = {};
    if (input != null) {
      output.customerId = Utils.getString(input.customerId, '');
      output.comment = Utils.getString(input.comment, '');
      output.rating = Utils.getFloat(input.rating, 0.0);
      output.imageProduct = Utils.getString(input.imageProduct, '');
      //output.createdDate = Utils.getDateFromString(input.createdDate);
    }
    return output;
  }
}
module.exports = Product;
