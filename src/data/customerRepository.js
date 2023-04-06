'use strict';

const { defaultsDeep } = require('lodash');
const BaseRepository = require('./baseRepository');
const CustomerDto = require('./models/Customers');

const { CollectionModel, CustomerModel } = require('../models');
const { compareTwoText } = require('../libs/bcrypt_helper');
const { logger } = require('../libs/logger');

const defaultOpts = {};

class CustomerRepository extends BaseRepository {
  /**
   * @param {*} opts
   * @param {RedisClient} redis
   */
  constructor(opts, redis) {
    super();
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.redis = redis;
  }
  /**
   *
   * @param {*} query
   * @param {Number} limit
   * @param {Number} page
   * @param {Boolean} count with count number of records
   * @returns {Promise<CollectionModel<CustomerModel>>}
   */
  async findCustomer(query = {}, limit = 10, page = 1, count = false) {
    const coll = new CollectionModel();
    coll.page = page;
    coll.limit = limit;
    try {
      const docs = await CustomerDto.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      if (docs.length > 0) {
        coll.data = docs.map((item) => CustomerModel.fromMongo(item));
      }
      coll.total = count ? await CustomerDto.count(query) : docs.length;
    } catch (err) {
      logger.error(err, err.message);
    }
    return coll;
  }
  async findAllData(data) {
    let coll = await CustomerDto.find({ ...data });
    if (coll.length > 0) {
      coll = coll.map((item) => CustomerModel.fromMongo(item));
    }
    return coll;
  }
  async createOne(data) {
    if (data == null) {
      return;
    }
    const doc = await new CustomerDto(data).save();
    const inserted = CustomerModel.fromMongo(doc);
    return inserted;
  }
  async findOne(key, value) {
    const coll = await CustomerDto.findOne({ [key]: value });
    const inserted = CustomerModel.fromMongo(coll);
    return inserted;
  }
  async findData(data) {
    const docs = await CustomerDto.find(data);
    const coll = docs.map((item) => CustomerModel.fromMongo(item));
    return coll;
  }
  async update(query = {}, update = {}) {
    try {
      const coll = await CustomerDto.findOneAndUpdate(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  async updateMany(query = {}, update = {}) {
    try {
      const coll = await CustomerDto.updateMany(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  async updateCustomerById(msg) {
    const { uid, data } = msg;
    const coll = await this.update(
      { uid: uid },
      {
        ...data,
      },
    );
    const inserted = CustomerModel.fromMongo(coll);
    return inserted;
  }
  async delete(data) {
    if (data == null) {
      return;
    }
    const coll = await CustomerDto.delete({ uid: data });
    return coll;
  }
  async deleteCustomerById(value) {
    const deleted = await this.delete(value);
    return deleted;
  }
  async deleteMany(key, value) {
    // value type array
    if (value == null) {
      return;
    }
    const coll = await CustomerDto.delete({ [key]: { $in: value } });
    return coll;
  }
  async generateCode() {
    const count = await CustomerDto.find();
    const total = count.length + 1;
    const number = ('0000' + total).slice(-4);
    return `KH${number}`;
  }
  async search(data) {
    const paging = {
      total: 0,
      page: data.page,
      limit: data.limit,
    };
    const pipe = [
      {
        $addFields: {
          status_: {
            $toString: '$status',
          },
        },
      },
      {
        $match: {
          code: !data.code
            ? { $regex: '', $options: 'i' }
            : { $regex: data.code, $options: 'i' },
          nameUnsigned: !data.name
            ? { $regex: '', $options: 'i' }
            : { $regex: data.name.toLowerCase(), $options: 'i' },
          status_: !data.status
            ? { $regex: '', $options: 'i' }
            : { $regex: data.status, $options: 'i' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    const coll = await CustomerDto.aggregate(pipe)
      .sort({ createdAt: -1 })
      .skip((data.page - 1) * data.limit)
      .limit(data.limit);

    const total = await CustomerDto.aggregate(pipe).count('code');
    paging.total = total.length > 0 ? total[0].code : 0;

    if (coll.total === 0) {
      return coll;
    }
    return [coll, paging];
  }
  async comparePasswordLogin(data) {
    const coll = await this.findCustomer(
      {
        // $or: [
        //   { clientCode: { $regex: `^${username}$`, $options: 'i' } },
        //   { email: { $regex: `^${username}$`, $options: 'i' } },
        // ],
        // ...role,
        username: { $regex: `^${data.username}$`, $options: 'i' },
      },
      1,
      1,
      false,
    );
    if (coll.total === 0) {
      return null;
    }
    const customer = coll.data[0];
    const passwordFind = customer.password;
    if (!compareTwoText(data.password, passwordFind)) {
      return null;
    }
    customer.password = undefined;
    return customer;
  }
}
module.exports = CustomerRepository;
