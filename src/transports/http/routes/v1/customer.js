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
   * Create new customer
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
  view: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const output = await customerService.viewCustomerById(uid);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const output = await customerService.deleteCustomerById(uid);
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  status: async (req, res, next) => {
    try {
      const { value: uid } = req.swagger.params.uid;
      const data = CustomerModel.fromUpdateStatusCustomer(req.body);
      const output = await customerService.updateStatusCustomer({ uid, data });
      res.json({
        success: true,
        results: output,
      });
    } catch (error) {
      next(error);
    }
  },
  search: async (req, res, next) => {
    try {
      const data = CustomerModel.searchCustomer(req.query);
      const output = await customerService.searchCustomer(data);
      res.json({
        success: true,
        results: { data: output[0], paging: output[1] },
      });
    } catch (error) {
      next(error);
    }
  },
};
