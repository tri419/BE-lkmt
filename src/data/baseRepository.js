'use strict';
import { ErrorModel } from '../models';
import { DATABASE, VALIDATION } from '../constants/error';

class BaseRepository {
  /**
   *
   * @param {Error} err
   */
  parseError(err) {
    if (err.sql) {
      switch (err.code) {
        case 'ER_DUP_ENTRY':
          return ErrorModel.initWithParams({ ...DATABASE.DUPLICATE });
        default:
          return err;
      }
    } else {
      switch (err.constructor.name) {
        case 'ValidationError':
          return ErrorModel.initWithParams({
            ...DATABASE.GENERIC,
            message: err.message,
            http: 400,
          });
        case 'UniqueViolationError':
          return ErrorModel.initWithParams({ ...DATABASE.DUPLICATE });
        case 'MongooseError':
          return this.parseMongooseError(err);
        default:
          return err;
      }
    }
  }

  parseMongooseError(err) {
    if (err != null) {
      let error = err;
      if (err.errors != null) {
        const arr = Object.values(err.errors);
        if (arr.length > 0) {
          error = arr[0];
        }
      }
      switch (error.kind) {
        case 'unique':
          return ErrorModel.initWithParams({ ...DATABASE.DUPLICATE });
        case 'ObjectId':
          return ErrorModel.initWithParams({
            ...VALIDATION.NOT_FOUND,
          });
        default:
          return error;
      }
    } else {
      return new Error('Unknown Error');
    }
  }
}

export default BaseRepository;
