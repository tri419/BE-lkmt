'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/user_repository")} userRepository
 * @typedef {import("../data/productType_repository")} productTypeRepository
 * @typedef {import("../data/brand_repository")} brandRepository
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
   * @param {productTypeRepository} repoProductType
   * @param {brandRepository} repoBrand
   */
  constructor(
    opts,
    policy,
    repo,
    repoCustomer,
    repoOrder,
    repoUser,
    repoProductType,
    repoBrand,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoCustomer = repoCustomer;
    this.repoOrder = repoOrder;
    this.repoUser = repoUser;
    this.repoProductType = repoProductType;
    this.repoBrand = repoBrand;
  }
  async create(data) {
    data.code = await this.repo.generateCode();
    data.uid = ulid();
    const checkPrice = data.price * (100 - data.discount);
    if (data.discountPrice !== checkPrice) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Giá khuyến mãi không khớp',
      });
    }
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateProduct(msg) {
    const { uid, data } = msg;
    const findProduct = await this.repo.findOne('uid', uid);
    if (!findProduct) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const checkPrice = (data.price * (100 - data.discount)) / 100;
    if (data.discountPrice !== checkPrice) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Giá khuyến mãi không khớp',
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
    const findProductType = await this.repoProductType.findOne(
      'uid',
      findProduct.productType,
    );
    const findBrand = await this.repoBrand.findOne('uid', findProduct.brand);
    const output = {
      code: findProduct.code,
      name: findProduct.name,
      price: findProduct.price,
      status: findProduct.status,
      discount: findProduct.discount,
      discountPrice: findProduct.discountPrice,
      expiryDate: findProduct.expiryDate,
      productType: findProductType.name,
      brand: findBrand.name,
      image: findProduct.image,
      descriptionSummary: findProduct.descriptionSummary,
      descriptionDetail: findProduct.descriptionDetail,
      quantity: findProduct.quantity,
    };
    return output;
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
  async updateStatusProduct(msg) {
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
  async searchProduct(data) {
    const output = await this.repo.search(data);
    return output;
  }
  async listProduct() {
    const output = await this.repo.listProduct();
    return output;
  }
}
module.exports = ProductService;
