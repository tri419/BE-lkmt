'use strict';
/**
 * @typedef {import("./policy")} PolicyService
 * @typedef {import("../data/order_repository")} orderRepository
 * @typedef {import("../data/customer_repository")} customerRepository
 * @typedef {import("../data/product_repository")} productRepository
 * @typedef {import("../data/cart_repository")} cartRepository
 * @typedef {import("../data/user_repository")} userRepository
 */
const { defaultsDeep } = require('lodash');
const { ulid } = require('ulid');
const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { Utils } = require('../libs/utils');
const moment = require('moment');
const paypal = require('paypal-rest-sdk');
const querystring = require('qs');
const crypto = require('crypto');
const defaultOpts = {};
class OrderService {
  /**
   *
   * @param {*} opts
   * @param {PolicyService} policy
   * @param {orderRepository} repo
   * @param {cartRepository} repoCart
   * @param {customerRepository} repoCustomer
   * @param {productRepository} repoProduct
   * @param {userRepository} repoUser
   */
  constructor(
    opts,
    policy,
    repo,
    repoCart,
    repoCustomer,
    repoProduct,
    repoUser,
  ) {
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.policy = policy;
    this.repo = repo;
    this.repoCart = repoCart;
    this.repoCustomer = repoCustomer;
    this.repoProduct = repoProduct;
    this.repoUser = repoUser;
  }
  async create(data) {
    data.uid = ulid();
    data.orderCode = await this.repo.generateOrderCode();
    data.date = moment(new Date()).format('YYYY/MM/DD');
    if (data.product.length === 0) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Hãy thêm sản phẩm vào giỏ hàng',
      });
    }
    const output = await this.repo.create(data);
    await this.repoCart.update(
      { customerId: data.customerId },
      {
        $set: {
          product: [],
        },
      },
    );
    return output;
  }
  async createOrderAdmin(data) {
    data.uid = ulid();
    data.orderCode = await this.repo.generateOrderCode();
    data.date = moment(new Date()).format('YYYY/MM/DD');
    if (data.product.length === 0) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Hãy thêm sản phẩm vào đơn hàng',
      });
    }
    const output = await this.repo.create(data);
    return output;
  }
  async updateOrder(msg) {
    const { uid, data } = msg;
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Không tìm thấy đơn hàng đơn hàng',
      });
    }
    if (data.product.length === 0) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Hãy thêm sản phẩm vào đơn hàng',
      });
    }
    const output = await this.repo.updateOrder(msg);
    return output;
  }
  async searchOrder(data) {
    const status = [
      'wait_for_confirmation',
      'approved',
      'ready_to_ship',
      'transporting',
      'completed',
      'cancelled',
    ];
    if (data.status) {
      if (status.indexOf(data.status) == -1) {
        throw ErrorModel.initWithParams({
          ...ERROR.VALIDATION.INVALID_REQUEST,
          message: 'Trạng thái đơn hàng không hợp lệ',
        });
      }
    }
    const output = await this.repo.search(data);
    return output;
  }
  async viewOrderById(uid) {
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    const findCustomer = await this.repoCustomer.findOne(
      'uid',
      findOrder.customerId,
    );
    const listProduct = [];
    if (findOrder.product.length > 0) {
      for (let i = 0; i < findOrder.product.length; i++) {
        const findProduct = await this.repoProduct.findOne(
          'uid',
          findOrder.product[i].productId,
        );
        listProduct.push({
          productId: findProduct.uid,
          name: findProduct.name,
          number: findOrder.product[i].number,
          image: findProduct.image[0],
          price: findOrder.product[i].price,
        });
      }
    }
    const output = {
      uid: uid,
      orderCode: findOrder.orderCode,
      customerId: findOrder.customerId,
      customerName: findCustomer.name,
      product: listProduct,
      status: findOrder.status,
      typePayment: findOrder.typePayment,
      phone: findOrder.phone,
      email: findOrder.email,
      address: findOrder.address,
      totalAmount: findOrder.totalAmount,
      shipperId: findOrder.shipperId,
    };
    return output;
  }
  async approveOrder(msg) {
    const { uid, data } = msg;
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    if (findOrder.status !== 'wait_for_confirmation') {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Trạng thái đơn hàng không hợp lệ',
      });
    }
    const output = await this.repo.updateOrder(msg);
    return output;
  }
  async readyToShipOrder(msg) {
    const { uid, data } = msg;
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    if (findOrder.status !== 'approved') {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Trạng thái đơn hàng không hợp lệ',
      });
    }
    const output = await this.repo.updateOrder(msg);
    return output;
  }
  async transportOrder(msg) {
    const { uid, data } = msg;
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    if (findOrder.status !== 'ready_to_ship') {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Trạng thái đơn hàng không hợp lệ',
      });
    }
    const output = await this.repo.updateOrder(msg);
    return output;
  }
  async completeOrder(msg) {
    const { uid, data } = msg;
    data.deliveryDate = moment(new Date()).format('YYYY/MM/DD');
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    if (findOrder.status !== 'transporting') {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Trạng thái đơn hàng không hợp lệ',
      });
    }
    const output = await this.repo.updateOrder(msg);
    return output;
  }
  async createPayment(data) {
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'Redhock Bar Soap',
                sku: '001',
                price: '25.00',
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: '25.00',
          },
          description: 'Washing Bar soap',
        },
      ],
    };
    let link;
    //await this.payment(paypal.payment.error, paypal.payment)
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            link = payment.links[i].href;
            console.log(link);
          }
        }
      }
    });
  }
  async listOrderShipper(userId) {
    const output = await this.repo.listOrderShipper(userId);
    return output;
  }
  async historyOrder(customerId, data) {
    const status = [
      'wait_for_confirmation',
      'approved',
      'ready_to_ship',
      'transporting',
      'completed',
      'cancelled',
    ];
    if (data.status) {
      if (status.indexOf(data.status) == -1) {
        throw ErrorModel.initWithParams({
          ...ERROR.VALIDATION.INVALID_REQUEST,
          message: 'Trạng thái đơn hàng không hợp lệ',
        });
      }
    }
    const output = await this.repo.historyOrder(customerId, data);
    for (let i = 0; i < output.length; i++) {
      const product = [];
      for (let index = 0; index < output[i].product.length; index++) {
        const findProduct = await this.repoProduct.findOne(
          'uid',
          output[i].product[index].productId,
        );
        product.push({
          productId: findProduct.uid,
          name: findProduct.name,
          image: findProduct.image,
          number: output[i].product[index].number,
          price: output[i].product[index].price,
        });
      }
      output[i].product = product;
    }
    return output;
  }
  async cancelOrder(msg) {
    const { uid, data } = msg;
    const findOrder = await this.repo.findOne('uid', uid);
    if (!findOrder) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
      });
    }
    if (findOrder.status !== 'wait_for_confirmation') {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.NOT_FOUND,
        message: 'Trạng thái đơn hàng không hợp lệ',
      });
    }
    const output = await this.repo.updateOrder(msg);
    return output;
  }
  async homePage(data) {
    const orderInDate = await this.repo.orderInDate();
    const statusOrder = await this.repo.statusOrder();
    let topProduct = [];
    let totalAmount = 0;
    if (data.start == '' && data.end == '') {
      topProduct = await this.repo.topProduct1();
      totalAmount = await this.repo.totalAmount1();
    } else {
      topProduct = await this.repo.topProduct(data);
      totalAmount = await this.repo.totalAmount(data);
    }

    return {
      orderInDate,
      statusOrder,
      topProduct,
      totalAmount,
    };
  }
  async sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
  async create_payment_url(data) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const ipAddr = '127.0.0.1';

    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    const returnUrl = process.env.vnp_ReturnUrl;
    const amount = data.price;
    //let orderCode = data.orderCode;
    //let bankCode = 'NCB';

    //let locale = data.language;
    // if (locale === null || locale === '') {
    //   locale = 'vn';
    // }
    //let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = data.orderCode;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + data.orderCode;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = await this.sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
  }
  async return(req) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    vnp_Params = await this.sortObject(vnp_Params);
    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    if (secureHash === signed) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
      //res.render('success', { code: vnp_Params['vnp_ResponseCode'] });
      //return vnp_Params['vnp_ResponseCode'];
      if (vnp_Params['vnp_ResponseCode'] == '00') {
        const findOrder = await this.repo.findOne(
          'orderCode',
          vnp_Params['vnp_TxnRef'],
        );
        const msg = {
          uid: findOrder.uid,
          data: {
            paid: true,
          },
        };
        const output = await this.repo.updateOrder(msg);
        return vnp_Params['vnp_ResponseCode'];
      }
    } else {
      //res.render('success', { code: '97' });
      return '97';
    }
  }
  async ipnVnPay() {
    // let vnp_Params = req.query;
    // let secureHash = vnp_Params['vnp_SecureHash'];
    // let orderId = vnp_Params['vnp_TxnRef'];
    // let rspCode = vnp_Params['vnp_ResponseCode'];
    // delete vnp_Params['vnp_SecureHash'];
    // delete vnp_Params['vnp_SecureHashType'];
    // vnp_Params = await this.sortObject(vnp_Params);
    // let tmnCode = process.env.vnp_TmnCode;
    // let secretKey = process.env.vnp_HashSecret;
    // let signData = querystring.stringify(vnp_Params, { encode: false });
    // let hmac = crypto.createHmac('sha512', secretKey);
    // let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  }
}
module.exports = OrderService;
