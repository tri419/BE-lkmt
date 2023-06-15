'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/cart_repository")} cartRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');
const moment = require('moment');
const {
  compareTwoText,
  hashText,
  HashToText,
} = require('../libs/bcrypt_helper');
const Customer = require('../models/customer');
const JWT = require('jsonwebtoken');

const cloudinary = require('cloudinary').v2;

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tri12420011@gmail.com',
    pass: 'occhoisreal1',
  },
});

const defaultOpts = {};
class CustomerService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {customerRepository} repo
   * @param {productRepository} repoProduct
   * @param {orderRepository} repoOrder
   * @param {cartRepository} repoCart
   */
  constructor(opts, policy, repo, repoProduct, repoOrder, repoCart) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoProduct = repoProduct;
    this.repoOrder = repoOrder;
    this.repoCart = repoCart;
  }
  async create(data) {
    const coll = await this.repo.findCustomer(
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
    // cloudinary.uploader.upload(data.files.avatar.path, function(error, result) {
    //   if (error) {
    //     console.log('Error uploading avatar: ', error);
    //     res.status(500).send('Error uploading avatar');
    //   } else {
    //     console.log('Avatar uploaded successfully: ', result.secure_url);
    //     data.avatar = result.secure_url;
    //   }});
    data.code = await this.repo.generateCode();
    data.uid = ulid();
    data.dateOfBirth = moment(new Date(data.dateOfBirth)).format('YYYY/MM/DD');
    const output = await this.repo.createOne(data);
    return output;
  }
  async updateCustomer(msg) {
    const { uid, data } = msg;
    const coll = await this.repo.findCustomer(
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
    data.dateOfBirth = moment(new Date(data.dateOfBirth)).format('YYYY/MM/DD');
    data.password = hashText(data.password);
    const findCustomer = await this.repo.findOne('uid', uid);
    if (!findCustomer) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateCustomerById(msg);
    return output;
  }
  async viewCustomerById(uid) {
    const findCustomer = await this.repo.findOne('uid', uid);
    if (!findCustomer) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    findCustomer.password = HashToText(findCustomer.password);
    return findCustomer;
  }
  async deleteCustomerById(uid) {
    const findCustomer = await this.repo.findOne('uid', uid);
    if (!findCustomer) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    try {
      await this.repo.deleteCustomerById(uid);
      return true;
    } catch (error) {
      return false;
    }
  }
  async updateStatusCustomer(msg) {
    const { uid, data } = msg;
    const findCustomer = await this.repo.findOne('uid', uid);
    if (!findCustomer) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const output = await this.repo.updateCustomerById(msg);
    return output;
  }
  async searchCustomer(data) {
    const output = await this.repo.search(data);
    return output;
  }
  async login(data) {
    const customer = await this.repo.comparePasswordLogin(data);
    if (customer == null) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
      });
    }
    //3. Check status
    if (customer.status === false) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message:
          'Tài khoản của bạn đang bị khóa. Hãy liên hệ với Admin để mở tài khoản.',
      });
    }
    const cart = await this.repoCart.findOne('customerId', customer.uid);
    customer.cartId = cart.uid;
    const token = await this.generateCode(customer);
    return { customer, token };
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
      const customer = await this.repo.findOne('uid', data.uid);
      if (!customer) {
        throw new Error();
      }
      req.customer = customer.uid;
    } catch (error) {
      res.status(401).send({ error: 'Not authorized to access this resource' });
    }
  }
  async forgotPassword(data, req) {
    const findEmail = await this.repo.findOne('email', data.email);
    if (!findEmail) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Chưa có email nào được tìm thấy',
      });
    }
    const token = crypto.randomBytes(20).toString('hex');
    // findEmail.resetPasswordToken = token;
    // findEmail.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    const msg = {
      uid: findEmail.uid,
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
    };
    const output = await this.repo.updateCustomerById(msg);
    const mailOptions = {
      from: 'tri12420011@gmail.com',
      to: data.email,
      subject: 'Reset your password',
      text: `Please click the link below to reset your password:\n\n${req.headers.origin}/reset-password/${token}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
    return mailOptions;
  }
  async confirmPassword(token, data) {
    const user = await this.repo.findOne('resetPasswordToken', token);
    if (!user) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Mã xác thực không hợp chính xác',
      });
    }
    const msg = {
      uid: user.uid,
      data: {
        password: hashText(data.password),
        resetPasswordToken: '',
        resetPasswordExpires: '',
      },
    };
    try {
      const output = await this.repo.updateCustomerById(msg);
      return true;
    } catch (error) {
      return false;
    }
  }
}
module.exports = CustomerService;
