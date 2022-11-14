'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/user_repository")} userRepository
 * @typedef {import("../data/brand_repository")} brandRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class BrandService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {productRepository} repoProduct
   * @param {customerRepository} repoCustomer
   * @param {orderRepository} repoOrder
   * @param {userRepository} repoUser
   * @param {brandRepository} repo
   */
  constructor(
    opts,
    policy,
    repoProduct,
    repoCustomer,
    repoOrder,
    repoUser,
    repo,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repoProduct = repoProduct;
    this.repoCustomer = repoCustomer;
    this.repoOrder = repoOrder;
    this.repoUser = repoUser;
    this.repo = repo;
  }

  async create(data) {
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateBrand(msg) {
    const { uid, data } = msg;
    const findBrand = await this.repo.findOne('uid', uid);
    if (!findBrand) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateBrandById(msg);
    return output;
  }
  async viewBrandById(uid) {
    const findBrand = await this.repo.findOne('uid', uid);
    if (!findBrand) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    return findBrand;
  }
  async deleteBrandById(uid) {
    const findBrand = await this.repo.findOne('uid', uid);
    if (!findBrand) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    try {
      await this.repo.deleteBrandById(uid);
      return true;
    } catch (error) {
      return false;
    }
  }
  async updateStatusBrand(msg) {
    const { uid, data } = msg;
    const findBrand = await this.repo.findOne('uid', uid);
    if (!findBrand) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateBrandById(msg);
    return output;
  }
  // async searchBrand(data) {
  //   const output = await this.repo.search(data);
  //   return output;
  // }
}
module.exports = BrandService;
