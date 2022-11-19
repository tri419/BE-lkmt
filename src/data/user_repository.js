'use strict';

const { defaultsDeep } = require('lodash');
const BaseRepository = require('./base_repository');
const UserDto = require('./models/Users');

const { CollectionModel, UserModel } = require('../models');
const { logger } = require('../libs/logger');
const { Utils } = require('../libs/utils');
const { compareTwoText, hashText } = require('../libs/bcrypt_helper');
const defaultOpts = {};

class UserRepository extends BaseRepository {
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
   * @returns {Promise<CollectionModel<UserModel>>}
   */
  async findUser(query = {}, limit = 10, page = 1, count = false) {
    const coll = new CollectionModel();
    coll.page = page;
    coll.limit = limit;
    try {
      const docs = await UserDto.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      if (docs.length > 0) {
        coll.data = docs.map((item) => UserModel.fromMongo(item));
      }
      coll.total = count ? await UserDto.count(query) : docs.length;
    } catch (err) {
      logger.error(err, err.message);
    }
    return coll;
  }
  async findAllData(data) {
    let coll = await UserDto.find({ ...data });
    if (coll.length > 0) {
      coll = coll.map((item) => UserModel.fromMongo(item));
    }
    return coll;
  }
  async createOne(data) {
    if (data == null) {
      return;
    }
    const doc = await new UserDto(data).save();
    const inserted = UserModel.fromMongo(doc);
    return inserted;
  }
  async findOne(key, value) {
    const coll = await UserDto.findOne({ [key]: value });
    const inserted = UserModel.fromMongo(coll);
    return inserted;
  }
  async findData(data) {
    const docs = await UserDto.find(data);
    const coll = docs.map((item) => UserModel.fromMongo(item));
    return coll;
  }
  async update(query = {}, update = {}) {
    try {
      const coll = await UserDto.findOneAndUpdate(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  async updateMany(query = {}, update = {}) {
    try {
      const coll = await UserDto.updateMany(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  async updateUserById(msg) {
    const { uid, data } = msg;
    const coll = await this.update(
      { uid: uid },
      {
        ...data,
      },
    );
    const inserted = UserModel.fromMongo(coll);
    return inserted;
  }
  async delete(data) {
    if (data == null) {
      return;
    }
    const coll = await UserDto.delete({ uid: data });
    return coll;
  }
  async deleteUserById(value) {
    const deleted = await this.delete(value);
    return deleted;
  }
  async deleteMany(key, value) {
    // value type array
    if (value == null) {
      return;
    }
    const coll = await UserDto.delete({ [key]: { $in: value } });
    return coll;
  }
  async generateCode() {
    const count = await UserDto.find();
    const total = count.length + 1;
    const number = ('0000' + total).slice(-4);
    return `User${number}`;
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
    const coll = await UserDto.aggregate(pipe)
      .sort({ createdAt: -1 })
      .skip((data.page - 1) * data.limit)
      .limit(data.limit);

    const total = await UserDto.aggregate(pipe).count('code');
    paging.total = total.length > 0 ? total[0].code : 0;

    if (coll.total === 0) {
      return coll;
    }
    return [coll, paging];
  }
  async comparePasswordLogin(data) {
    const coll = await this.findUser(
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
    const user = coll.data[0];
    const passwordFind = user.password;
    if (!compareTwoText(data.password, passwordFind)) {
      return null;
    }
    user.password = undefined;
    return user;
  }
}
module.exports = UserRepository;
