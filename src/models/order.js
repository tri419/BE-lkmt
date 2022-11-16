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
const moment = require('moment');

class Order extends Base {
  constructor() {
    super();

    this.uid = undefined;
    /** @type {String} */

    this.orderCode = undefined;
    /** @type {String} */

    this.customerId = undefined;
    /** @type {String} */

    this.product = undefined;
    /** @type {Array} */

    this.transportFee = undefined;
    /** @type {Number} */

    this.status = undefined;
    /** @type {String} */

    this.typePayment = undefined;
    /** @type {String} */

    this.phone = undefined;
    /** @type {String} */

    this.email = undefined;
    /** @type {String} */

    this.address = undefined;
    /** @type {String} */

    this.date = undefined;
    /** @type {String} */

    this.totalAmount = undefined;
    /** @type {String} */
  }
  static fromMongo(input) {
    if (input == null || input instanceof mongoose.Types.ObjectId) {
      return null;
    }
    const output = new Order();
    if (input != null) {
      output.uid = input.uid;
      output.orderCode = input.orderCode;
      output.customerId = input.customerId;
      output.product = input.product.map((item) => {
        const value = {
          productId: item.productId,
          number: item.number,
          price: item.price,
        };
        return value;
      });
      output.transportFee = input.transportFee;
      output.status = input.status;
      output.typePayment = input.typePayment;
      output.phone = input.phone;
      output.email = input.email;
      output.address = input.address;
      output.date = input.date;
      output.totalAmount = {
        total: input.totalAmount.total,
        discount: input.totalAmount.discount,
      };
      output.shipperId = input.shipperId;
      output.createdAt = input.createdAt;
      output.updatedAt = input.updatedAt;
    }
    return output;
  }
  /**
   *
   * @param {Order} input
   * @returns {*}
   */
  static toMongo(input) {
    // eslint-disable-next-line no-unused-vars
    const { includedFields, ...Order } = input;
    return Order;
  }
  static fromRequest(input, cart, customerInfo) {
    const output = new Order();
    if (input != null) {
      output.uid = Utils.getString(input.uid, '');
      output.orderCode = customerInfo.orderCode;
      output.customerId = customerInfo.customerId;
      output.product = cart.map((item) => {
        const value = {
          productId: Utils.getString(item.uid, ''),
          number: Utils.getInteger(item.number, 0),
        };
        return value;
      });
      output.transportFee = Utils.getInteger(input.transportFee, 0);
      output.status = Utils.getString(input.status, '');
      output.typePayment = Utils.getString(input.typePayment, 'COD');
      output.phone = Utils.getString(input.phone, '');
      output.address = {
        street: Utils.getString(input.street, ''),
        province: Utils.getString(input.province, ''),
        district: Utils.getString(input.district, ''),
        ward: Utils.getString(input.ward, ''),
      };
      output.totalAmount = {
        total: Utils.getInteger(input.totalAmount.total, 0),
        discount: Utils.getInteger(input.totalAmount.discount, 0),
      };
      output.email = Utils.getString(input.email, '');
      output.date = '';
      output.shipperId = Utils.getString(input.shipperId, '');
      output.includedFields = Utils.extractIncludeAttributes(
        input.includedFields,
      );
    }
    return output;
  }
}
module.exports = Order;