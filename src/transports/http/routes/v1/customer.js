const { CustomerModel } = require('../../../../models');
const { customerService } = require('../../../../domain');
const { loggerService } = require('../../../../libs/logger');

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

module.exports = {
  /* --------------------------------- API ERP -------------------------------- */
  /**
   * Create new productType
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  create: async (req, res, next) => {
    try {
      const data = CustomerModel.fromRequest(req.body);
      const output = await customerService.create(data);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = CustomerModel.fromUpdateCustomer(req.body);
      const output = await customerService.updateCustomer({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
};
