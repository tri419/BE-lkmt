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
          uid: item.uid,
          productId: item.uid,
          number: item.number,
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
  static fromRequest(input, userId) {
    const output = new Cart();
    if (input != null) {
      output.customerId = Utils.getString(userId, '');
      output.product = [];
    }
    input.product.map((item) => {
      const index = output.product.findIndex(
        (s) => item.productId === s.productId,
      );
      if (index === -1) {
        const value = {
          uid: ulid(),
          productId: item.productId,
          number: item.number,
        };
        output.product.push(value);
      } else {
        output.product[index].number += item.number;
      }
    });
    output.includedFields = Utils.extractIncludeAttributes(
      input.includedFields,
    );
    return output;
  }
}
module.exports = Cart;
