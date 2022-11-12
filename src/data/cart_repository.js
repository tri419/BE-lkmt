'use strict';

const { defaultsDeep } = require('lodash');
const BaseRepository = require('./base_repository');
const CartDto = require('./models/Carts');

const { CollectionModel, CartModel } = require('../models');
const { logger } = require('../libs/logger');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class CartRepository extends BaseRepository {
  /**
   *
   * @param {*} query
   * @param {Number} limit
   * @param {Number} page
   * @param {Boolean} count with count number of records
   * @returns {Promise<CollectionModel<CartModel>>}
   */
  async findCart(query = {}, limit = 10, page = 1, count = false) {
    const coll = new CollectionModel();
    coll.page = page;
    coll.limit = limit;
    try {
      const docs = await CartDto.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      if (docs.length > 0) {
        coll.data = docs.map((item) => CartModel.fromMongo(item));
      }
      coll.total = count ? await CartDto.count(query) : docs.length;
    } catch (err) {
      logger.error(err, err.message);
    }
    return coll;
  }
  async findAllData(data) {
    let coll = await CartDto.find({ ...data });
    if (coll.length > 0) {
      coll = coll.map((item) => CartModel.fromMongo(item));
    }
    return coll;
  }
  async create(data) {
    if (data == null) {
      return;
    }
    const doc = await CartDto.insertMany(data);
    if (doc != null) {
      return true;
    }
  }
  async createOne(data) {
    if (data == null) {
      return;
    }
    const doc = await new CartDto(data).save();
    const inserted = CartModel.fromMongo(doc);
    return inserted;
  }
  async findOne(key, value) {
    const coll = await CartDto.findOne({ [key]: value });
    const inserted = CartModel.fromMongo(coll);
    return inserted;
  }
  //   //   async findOneDate(data) {
  //   //     const coll = await CartDto.findOne(data);
  //   //     const inserted = CartModel.fromMongo(coll);
  //   //     return inserted;
  //   //   }
  //   async findData(data) {
  //     const docs = await CartDto.find(data);
  //     const coll = docs.map((item) => CartModel.fromMongo(item));
  //     return coll;
  //   }

  //   async update(query = {}, update = {}) {
  //     try {
  //       const coll = await CartDto.findOneAndUpdate(query, update, {
  //         new: true,
  //       });
  //       return coll;
  //     } catch (err) {
  //       logger.error(err, err.message);
  //     }
  //   }
  //   async updateMany(query = {}, update = {}) {
  //     try {
  //       const coll = await CartDto.updateMany(query, update, {
  //         new: true,
  //       });
  //       return coll;
  //     } catch (err) {
  //       logger.error(err, err.message);
  //     }
  //   }
  //   async updateCartById(msg) {
  //     const { uid, data } = msg;
  //     const coll = await this.update(
  //       { uid: uid },
  //       {
  //         ...data,
  //       },
  //     );
  //     const inserted = CartModel.fromMongo(coll);
  //     return inserted;
  //   }
  //   async delete(data) {
  //     if (data == null) {
  //       return;
  //     }
  //     const coll = await CartDto.delete({ uid: data });
  //     return coll;
  //   }
  //   async deleteCartById(value) {
  //     const deleted = await this.delete(value);
  //     return deleted;
  //   }
  //   async deleteMany(key, value) {
  //     // value type array
  //     if (value == null) {
  //       return;
  //     }
  //     const coll = await CartDto.delete({ [key]: { $in: value } });
  //     return coll;
  //   }
}
module.exports = CartRepository;
