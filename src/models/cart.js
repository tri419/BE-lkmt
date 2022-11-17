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

class Cart extends Base {
  constructor() {
    super();
    /** @type {String} */
    this.uid = undefined;
    /** @type {String} */
    this.customerId = undefined;
    /** @type {String} */
    this.product = undefined;
  }
  /**
   *
   * @param {Document} input
   * @returns {Cart}
   */
  static fromMongo(input) {
    if (input == null || input instanceof mongoose.Types.ObjectId) {
      return null;
    }
    const output = new Cart();
    if (input != null) {
      output.uid = input.uid;
      output.customerId = input.customerId;
      output.product = input.product.map((item) => {
        return {
          productId: item.productId,
          number: item.number,
          price: item.price,
        };
      });
      output.createdAt = input.createdAt;
      output.updatedAt = input.updatedAt;
    }
    return output;
  }
  /**
   *
   * @param {Cart} input
   * @returns {*}
   */
  static toMongo(input) {
    // eslint-disable-next-line no-unused-vars
    const { includedFields, ...Cart } = input;
    return Cart;
  }
  static fromRequest(input, customerId) {
    const output = new Cart();
    if (input != null) {
      output.uid = Utils.getString(input.uid, '');
      output.customerId = Utils.getString(customerId, '');
      output.product = Utils.getArray(input.product, []);
    }
    output.includedFields = Utils.extractIncludeAttributes(
      input.includedFields,
    );
    return output;
  }
  static fromUpdate(input) {
    const output = {};
    if (input != null) {
      output.productId = Utils.getString(input.productId, '');
      output.number = Utils.getInteger(input.number, 0);
      output.price = Utils.getInteger(input.price, 0);
    }
    return output;
  }
  static create(input, customerId) {
    const output = new Cart();
    if (customerId != null) {
      output.uid = '';
      output.customerId = Utils.getString(customerId, '');
    }
    output.includedFields = Utils.extractIncludeAttributes(
      input.includedFields,
    );
    return output;
  }
}
module.exports = Cart;
