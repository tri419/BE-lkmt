'use strict';

const { defaultsDeep } = require('lodash');
const BaseRepository = require('./baseRepository');
const RoleDto = require('./models/Roles');

const { CollectionModel, RoleModel } = require('../models');
const { logger } = require('../libs/logger');
const { Utils } = require('../libs/utils');

const defaultOpts = {};

class RoleRepository extends BaseRepository {
  /**
   *
   * @param {*} query
   * @param {Number} limit
   * @param {Number} page
   * @param {Boolean} count with count number of records
   * @returns {Promise<CollectionModel<RoleModel>>}
   */
  async findRole(query = {}, limit = 10, page = 1, count = false) {
    const coll = new CollectionModel();
    coll.page = page;
    coll.limit = limit;
    try {
      const docs = await RoleDto.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      if (docs.length > 0) {
        coll.data = docs.map((item) => RoleModel.fromMongo(item));
      }
      coll.total = count ? await RoleDto.count(query) : docs.length;
    } catch (err) {
      logger.error(err, err.message);
    }
    return coll;
  }
  async findAllData(data) {
    let coll = await RoleDto.find({ ...data });
    if (coll.length > 0) {
      coll = coll.map((item) => RoleModel.fromMongo(item));
    }
    return coll;
  }
  async create(data) {
    if (data == null) {
      return;
    }
    const doc = await RoleDto.insertMany(data);
    if (doc != null) {
      return true;
    }
  }
  async createOne(data) {
    if (data == null) {
      return;
    }
    const doc = await new RoleDto(data).save();
    const inserted = RoleModel.fromMongo(doc);
    return inserted;
  }
  async findOne(key, value) {
    const coll = await RoleDto.findOne({ [key]: value });
    const inserted = RoleModel.fromMongo(coll);
    return inserted;
  }
  async findData(data) {
    const docs = await RoleDto.find(data);
    const coll = docs.map((item) => RoleModel.fromMongo(item));
    return coll;
  }

  async update(query = {}, update = {}) {
    try {
      const coll = await RoleDto.findOneAndUpdate(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  async updateMany(query = {}, update = {}) {
    try {
      const coll = await RoleDto.updateMany(query, update, {
        new: true,
      });
      return coll;
    } catch (err) {
      logger.error(err, err.message);
    }
  }
  async updateRoleById(msg) {
    const { uid, data } = msg;
    const coll = await this.update(
      { uid: uid },
      {
        ...data,
      },
    );
    const inserted = RoleModel.fromMongo(coll);
    return inserted;
  }
  async delete(data) {
    if (data == null) {
      return;
    }
    const coll = await RoleDto.delete({ uid: data });
    return coll;
  }
  async deleteRoleById(value) {
    const deleted = await this.delete(value);
    return deleted;
  }
  async deleteMany(key, value) {
    // value type array
    if (value == null) {
      return;
    }
    const coll = await RoleDto.delete({ [key]: { $in: value } });
    return coll;
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
          name: !data.name
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
          uid: 1,
          name: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ];
    const coll = await RoleDto.aggregate(pipe)
      .sort({ createdAt: -1 })
      .skip((data.page - 1) * data.limit)
      .limit(data.limit);

    const total = await RoleDto.aggregate(pipe).count('code');
    paging.total = total.length > 0 ? total[0].code : 0;

    if (coll.total === 0) {
      return coll;
    }
    return [coll, paging];
  }
}
module.exports = RoleRepository;
