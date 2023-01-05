'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/user_repository")} userRepository
 * @typedef {import("../data/role_repository")} roleRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');
const JWT = require('jsonwebtoken');
const {
  compareTwoText,
  hashText,
  HashToText,
} = require('../libs/bcrypt_helper');
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
   * @param {roleRepository} repoRole
   */
  constructor(
    opts,
    policy,
    repoProduct,
    repoCustomer,
    repoOrder,
    repo,
    repoRole,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repoProduct = repoProduct;
    this.repoCustomer = repoCustomer;
    this.repoOrder = repoOrder;
    this.repo = repo;
    this.repoRole = repoRole;
  }
  async create(data) {
    const coll = await this.repo.findUser(
      {
        username: { $regex: `^${data.username}$`, $options: 'i' },
      },
      1,
      1,
      false,
    );
    if (coll.total > 0) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message: 'Tên đăng nhập đã tồn tại.',
      });
    }
    data.code = await this.repo.generateCode();
    data.uid = ulid();
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateUser(msg) {
    const { uid, data } = msg;
    const coll = await this.repo.findUser(
      {
        username: { $regex: `^${data.username}$`, $options: 'i' },
      },
      1,
      1,
      false,
    );
    if (coll.data[0].uid !== uid) {
      if (coll.total > 0) {
        throw ErrorModel.initWithParams({
          ...ERROR.VALIDATION.INVALID_REQUEST,
          message: 'Tên đăng nhập đã tồn tại.',
        });
      }
    }
    const findUser = await this.repo.findOne('uid', uid);
    if (!findUser) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    data.password = hashText(data.password);
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
    findUser.password = HashToText(findUser.password);
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
  async login(data) {
    const user = await this.repo.comparePasswordLogin(data);
    if (user == null) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
      });
    }
    //3. Check status
    if (user.status === false) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message:
          'Tài khoản của bạn đang bị khóa. Hãy liên hệ với Admin để mở tài khoản.',
      });
    }
    const findRole = await this.repoRole.findOne('uid', user.roleId);
    if (!findRole) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    user.roleId = findRole.name;
    const token = await this.generateCode(user);
    return { user, token };
  }
  async generateCode(data) {
    return JWT.sign(
      {
        iss: data.name,
        uid: data.uid,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3),
      },
      process.env.JWT_KEY,
    );
  }
  async auth(req, res, next) {
    if (req.header('Authorization') == '') {
      res.status(401).send({ error: 'Request null' });
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = JWT.verify(token, process.env.JWT_KEY);
    try {
      const user = await this.repo.findOne('uid', data.uid);
      if (!user) {
        throw new Error();
      }
      req.user = user.uid;
    } catch (error) {
      res.status(401).send({ error: 'Not authorized to access this resource' });
    }
  }
  async searchUserShipper() {
    const output = await this.repo.searchShipper();
    return output;
  }
}
module.exports = UserService;
