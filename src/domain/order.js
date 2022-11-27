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
    const output = {
      uid: uid,
      orderCode: findOrder.orderCode,
      customerId: findOrder.customerId,
      customerName: findCustomer.name,
      product: findOrder.product,
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
  async historyOrder(customerId) {
    const output = await this.repo.historyOrder(customerId);
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
}
module.exports = OrderService;
