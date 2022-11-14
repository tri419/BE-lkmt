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

class UserService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {productRepository} repoProduct
   * @param {customerRepository} repoCustomer
   * @param {orderRepository} repoOrder
   * @param {userRepository} repo
   */
  constructor(opts, policy, repoProduct, repoCustomer, repoOrder, repo) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repoProduct = repoProduct;
    this.repoCustomer = repoCustomer;
    this.repoOrder = repoOrder;
    this.repo = repo;
  }
  async create(data) {
    data.code = await this.repo.generateCode();
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateUser(msg) {
    const { uid, data } = msg;
    const findUser = await this.repo.findOne('uid', uid);
    if (!findUser) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateUserById(msg);
    return output;
  }
  async viewUserById(uid) {
    const findUser = await this.repo.findOne('uid', uid);
    if (!findUser) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    return findUser;
  }
  async deleteUserById(uid) {
    const findUser = await this.repo.findOne('uid', uid);
    if (!findUser) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    try {
      await this.repo.deleteUserById(uid);
      return true;
    } catch (error) {
      return false;
    }
  }
  async updateStatusUser(msg) {
    const { uid, data } = msg;
    const findUser = await this.repo.findOne('uid', uid);
    if (!findUser) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateUserById(msg);
    return output;
  }
  async searchUser(data) {
    const output = await this.repo.search(data);
    return output;
  }
}
module.exports = UserService;
