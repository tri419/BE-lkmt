'use strict';

const { defaultsDeep } = require('lodash');
const BaseRepository = require('./base_repository');
const OrderDto = require('./models/Orders');
const CustomerDto = require('./models/Customers');

const { CollectionModel, OrderModel } = require('../models');
const { logger } = require('../libs/logger');
const { Utils } = require('../libs/utils');
const moment = require('moment');
const { format } = require('prettier');
const defaultOpts = {};

class OrderRepository extends BaseRepository {
  /**
   * @param {*} opts
   */
  constructor(opts, redis) {
    super();
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
  }
  /**
   *
   * @param {*} query
   * @param {Number} limit
   * @param {Number} offset
   * @param {Boolean} count with count number of records
   * @returns {Promise<CollectionModel<OrderModel>>}
   */
  async findOrder(query = {}, limit = 100, page = 1, count = false) {
    const coll = new CollectionModel();
    coll.page = page;
    coll.limit = limit;
    try {
      const docs = await OrderDto.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      if (docs.length > 0) {
        coll.data = docs.map((item) => OrderModel.fromMongo(item));
      }
      coll.total = count ? await OrderDto.count(query) : docs.length;
    } catch (err) {
      logger.error(err, err.message);
    }
    return coll;
  }
  /**
   *
   * @param {*} query
   * @param {*} update
   * @returns {Promise<OrderModel>}
   */
  async update(query = {}, update = {}) {
    try {
      const coll = await OrderDto.findOneAndUpdate(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  /**
   *
   * @param {msg} Uid Data Of Order
   * @returns {status}
   */
  async updateStatus(msg) {
    const { uid, data } = msg;
    const coll = await this.update(
      { uid: uid },
      {
        $set: {
          status: data.status,
        },
      },
    );
    const inserted = OrderModel.fromMongo(coll);
    return inserted;
  }
  /**
   *
   * @param {msg} Uid Data Of Order
   * @returns {codeTrading}
   */
  async updateCodeTrading(msg) {
    const { uid, data } = msg;
    const coll = await this.update(
      { uid: uid },
      {
        $set: {
          codeTrading: data.codeTrading,
        },
      },
    );
    const inserted = OrderModel.fromMongo(coll);
    return inserted;
  }
  /**
   *
   * @param {msg} Uid Data of Order
   * @returns {Promise<OrderModel>}
   */
  async updateOrder(msg) {
    const { uid, data } = msg;
    const coll = await this.update(
      { uid: uid },
      {
        ...data,
      },
    );
    const inserted = OrderModel.fromMongo(coll);
    return inserted;
  }
  /**
   *
   * @param {*} key
   * @param {*} value
   * @returns {Promise<OrderModel>}
   */
  async findOne(key, value) {
    const coll = await OrderDto.findOne({ [key]: value });
    const inserted = OrderModel.fromMongo(coll);
    return inserted;
  }
  /**
   *
   * @param {*} data
   * @returns {Promise<OrderModel>}
   */
  async findOneData(data) {
    const coll = await OrderDto.findOne(data);
    const inserted = OrderModel.fromMongo(coll);
    return inserted;
  }
  /**
   *
   * @param {*} data
   * @returns {Promise<OrderModel>}
   */
  async findData(data) {
    let coll = await OrderDto.find(data);
    if (coll.length > 0) {
      coll = coll.map((item) => OrderModel.fromMongo(item));
    }
    return coll;
  }
  async create(data) {
    if (data == null) {
      return data;
    }
    const doc = await new OrderDto(data).save();
    const inserted = OrderModel.fromMongo(doc);
    return inserted;
  }
  async delete(data = {}) {
    if (data == null) {
      return;
    }

    const coll = await OrderDto.delete(data);
    return coll;
  }
  async generateOrderCode() {
    const dateDB = moment(new Date(Date.now())).format('YYYY-MM-DD');
    const count = await OrderDto.aggregate([
      {
        $project: {
          dailyDay: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
      },
      {
        $match: { dailyDay: dateDB },
      },
    ]);
    const total = count.length + 1;
    const number = ('000000' + total).slice(-6);
    const date = new Date().getDate();
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2);
    const year = new Date().getFullYear().toString().substr(-2);
    return `DH${year}${month}${date}${number}`;
  }
  async search(data) {
    const paging = {
      total: 0,
      page: data.page,
      limit: data.limit,
    };
    const pipe = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: 'uid',
          as: 'customer',
        },
      },
      {
        $unwind: '$customer',
      },
      {
        $match: {
          orderCode: !data.code
            ? { $regex: '', $options: 'i' }
            : { $regex: data.code, $options: 'i' },
          status: !data.status
            ? { $regex: '', $options: 'i' }
            : { $regex: data.status, $options: 'i' },
        },
      },
      {
        $project: {
          _id: 0,
          uid: 1,
          orderCode: 1,
          customer: '$customer.name',
          total: '$totalAmount.total',
          date: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipe)
      .sort({ createdAt: -1 })
      .skip((data.page - 1) * data.limit)
      .limit(data.limit);

    const total = await OrderDto.aggregate(pipe).count('orderCode');
    paging.total = total.length > 0 ? total[0].orderCode : 0;

    if (coll.total === 0) {
      return coll;
    }
    return [coll, paging];
  }
  async listOrderShipper(userId) {
    const pipe = [
      {
        $match: {
          shipperId: userId,
        },
      },
      {
        $project: {
          _id: 0,
          uid: 1,
          orderCode: 1,
          customer: '$customer.name',
          total: '$totalAmount.total',
          date: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipe).sort({ createdAt: -1 });
    return coll;
  }
  async historyOrder(customerId, data) {
    const pipe = [
      {
        $match: {
          customerId: customerId,
          status: !data.status
            ? { $regex: '', $options: 'i' }
            : { $regex: data.status, $options: 'i' },
        },
      },
      {
        $project: {
          _id: 0,
          uid: 1,
          orderCode: 1,
          customer: '$customer.name',
          total: '$totalAmount.total',
          product: 1,
          date: 1,
          deliveryDate: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipe).sort({ createdAt: -1 });
    return coll;
  }
  async orderInDate() {
    const now = new Date();
    const dateNow = moment(now).format('YYYYMMDD');
    const pipeNewOrder = [
      {
        $match: {
          status: { $ne: 'cancelled' },
        },
      },
      {
        $set: {
          date: { $dateToString: { format: '%Y%m%d', date: '$createdAt' } },
        },
      },
      {
        $match: {
          date: dateNow,
        },
      },
      {
        $group: {
          _id: dateNow,
          NewOrder: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const NewOrder = await OrderDto.aggregate(pipeNewOrder);
    const pipeCancelOrder = [
      {
        $match: {
          status: 'cancelled',
        },
      },
      {
        $set: {
          date: { $dateToString: { format: '%Y%m%d', date: '$createdAt' } },
        },
      },
      {
        $match: {
          date: dateNow,
        },
      },
      {
        $group: {
          _id: dateNow,
          CancelOrder: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const CancelOrder = await OrderDto.aggregate(pipeCancelOrder);
    const pipeTotalAmount = [
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $set: {
          date: { $dateToString: { format: '%Y%m%d', date: '$createdAt' } },
        },
      },
      {
        $match: {
          date: dateNow,
        },
      },
      {
        $group: {
          _id: dateNow,
          TotalAmount: { $sum: '$totalAmount.total' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const TotalAmount = await OrderDto.aggregate(pipeTotalAmount);
    const pipeNewCustomer = [
      {
        $match: {
          status: true,
        },
      },
      {
        $set: {
          date: { $dateToString: { format: '%Y%m%d', date: '$createdAt' } },
        },
      },
      {
        $match: {
          date: dateNow,
        },
      },
      {
        $group: {
          _id: dateNow,
          NewCustomer: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const NewCustomer = await CustomerDto.aggregate(pipeNewCustomer);
    return {
      newOrder: NewOrder[0] ? NewOrder[0].NewOrder : 0,
      cancelOrder: CancelOrder[0] ? CancelOrder[0].CancelOrder : 0,
      revenueOrder: TotalAmount[0] ? TotalAmount[0].TotalAmount : 0,
      newCustomer: NewCustomer[0] ? NewCustomer[0].NewCustomer : 0,
    };
  }
  async statusOrder() {
    const pipe = [
      {
        $match: {
          status: {
            $in: [
              'wait_for_confirmation',
              'approved',
              'confirmed',
              'ready_to_ship',
              'transporting',
              'completed',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$status',
          status: { $first: '$status' },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipe);
    const output = coll.reduce(
      (p, c) => {
        if (c.status === 'wait_for_confirmation') {
          p.wait_for_confirmation += c.total;
        } else if (c.status === 'approved') {
          p.approved += c.total;
        } else if (c.status === 'confirmed') {
          p.confirmed += c.total;
        } else if (c.status === 'ready_to_ship') {
          p.ready_to_ship += c.total;
        } else if (c.status === 'transporting') {
          p.transporting += c.total;
        } else if (c.status === 'completed') {
          p.completed += c.total;
        }
        p.numberOrder += c.total;
        return p;
      },
      {
        wait_for_confirmation: 0,
        approved: 0,
        confirmed: 0,
        ready_to_ship: 0,
        transporting: 0,
        completed: 0,
        numberOrder: 0,
      },
    );
    return output;
  }
  async topProduct(data) {
    const pipeline = [
      {
        $set: {
          date: { $dateToString: { format: '%Y/%m/%d', date: '$createdAt' } },
        },
      },
      {
        $match: {
          date: {
            $gte: data.start,
            $lte: data.end,
          },
        },
      },
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product.productId',
          foreignField: 'uid',
          as: 'productname',
        },
      },
      {
        $unwind: '$productname',
      },
      {
        $group: {
          _id: '$product.productId',
          uid: {
            $first: '$product.productId',
          },
          name: {
            $first: '$productname.name',
          },
          image: {
            $first: '$productname.image',
          },
          numberOrders: {
            $count: {},
          },
          numberProducts: {
            $sum: '$product.number',
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipeline).sort({
      numberProducts: -1,
    });
    return coll;
  }
  async totalAmount(data) {
    const pipeline = [
      {
        $set: {
          date: { $dateToString: { format: '%Y/%m/%d', date: '$createdAt' } },
        },
      },
      {
        $match: {
          date: {
            $gte: data.start,
            $lte: data.end,
          },
        },
      },
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: { $sum: '$totalAmount.total' },
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipeline);
    let total = 0;
    for (let i = 0; i < coll.length; i++) {
      total += coll[i].totalAmount;
    }
    return total;
  }
  async topProduct1() {
    const pipeline = [
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product.productId',
          foreignField: 'uid',
          as: 'productname',
        },
      },
      {
        $unwind: '$productname',
      },
      {
        $group: {
          _id: '$product.productId',
          uid: {
            $first: '$product.productId',
          },
          name: {
            $first: '$productname.name',
          },
          image: {
            $first: '$productname.image',
          },
          numberOrders: {
            $count: {},
          },
          numberProducts: {
            $sum: '$product.number',
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipeline).sort({
      numberProducts: -1,
    });
    return coll;
  }
  async totalAmount1() {
    const pipeline = [
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: { $sum: '$totalAmount.total' },
        },
      },
    ];
    const coll = await OrderDto.aggregate(pipeline);
    let total = 0;
    for (let i = 0; i < coll.length; i++) {
      total += coll[i].totalAmount;
    }
    return total;
  }
}
module.exports = OrderRepository;
