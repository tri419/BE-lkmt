'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/user_repository")} userRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class ProductService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {productRepository} repo
   * @param {customerRepository} repoCustomer
   * @param {orderRepository} repoOrder
   * @param {userRepository} repoUser
   */
  constructor(opts, policy, repo, repoCustomer, repoOrder, repoUser) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoCustomer = repoCustomer;
    this.repoOrder = repoOrder;
    this.repoUser = repoUser;
  }
  async create(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateById(msg) {
    const { uid, data } = msg;
    const findProduct = await this.repo.findOne('uid', uid);
    if (!findProduct) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateProductById(msg);
    return output;
  }
  async viewProductById(uid) {
    const findProduct = await this.repo.findOne('uid', uid);
    if (!findProduct) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    return findProduct;
  }
  async deleteProductById(uid) {
    const findProduct = await this.repo.findOne('uid', uid);
    if (!findProduct) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    try {
      await this.repo.deleteProductById(uid);
      return true;
    } catch (error) {
      return false;
    }
  }
}
module.exports = ProductService;
