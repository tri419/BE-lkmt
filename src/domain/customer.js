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
const { OAuth2Client } = require('google-auth-library');
const myOAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
);
myOAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
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
    const checkEmail = await this.repo.findOne('email', data.email);
    if (checkEmail) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message: 'Email người dùng đã tồn tại.',
      });
    }
    data.code = await this.repo.generateCode();
    data.uid = ulid();
    data.dateOfBirth = moment(new Date(data.dateOfBirth)).format('DD/MM/YYYY');
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
    if (coll.data.length > 0) {
      if (coll.data[0].uid !== uid) {
        if (coll.total > 0) {
          throw ErrorModel.initWithParams({
            ...ERROR.VALIDATION.INVALID_REQUEST,
            message: 'Tên đăng nhập đã tồn tại.',
          });
        }
      }
    }
    const checkEmail = await this.repo.findCustomer(
      { email: data.email },
      1,
      1,
      false,
    );
    if (checkEmail.data.length > 0) {
      if (checkEmail.data[0].uid !== uid) {
        if (checkEmail.total > 0) {
          throw ErrorModel.initWithParams({
            ...ERROR.VALIDATION.INVALID_REQUEST,
            message: 'Email thay đổi đã tồn tại.',
          });
        }
      }
    }
    data.dateOfBirth = moment(new Date(data.dateOfBirth)).format('DD/MM/YYYY');
    //sdata.password = hashText(data.password);
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
    const token = crypto.randomBytes(6).toString('hex');
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
    const myAccessTokenObject = await myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'caotri1242001@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken: myAccessToken,
      },
    });
    const mailOptions = {
      from: 'caotri1242001@gmail.com',
      to: data.email,
      subject: 'Reset your password',
      text: `Mã xác thực để lấy lại mật khẩu của bạn là:\n\n${token}`,
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
  async updateAddressCustomer(msg) {
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
  async changePassword(uid, data) {
    const findCustomer = await this.repo.findOne('uid', uid);
    if (!findCustomer) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Không tìm thấy khách hàng này',
      });
    }
    const currentPassword = HashToText(findCustomer.password);
    if (currentPassword !== data.oldPassword) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Mật khẩu hiện tại không chính xác',
      });
    }
    if (data.newPassword !== data.rePassword) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Mật khẩu mới và nhập lại mật khẩu không giống nhau',
      });
    }

    const msg = {
      uid: uid,
      data: {
        password: hashText(data.newPassword),
      },
    };
    const output = await this.repo.updateCustomerById(msg);
    return output;
  }
}
module.exports = CustomerService;
