const { RoleModel } = require('../../../../models');
const { roleService } = require('../../../../domain');
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
      const data = RoleModel.fromRequest(req.body);
      const output = await roleService.createRole(data);
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
      const data = RoleModel.fromUpdateRole(req.body);
      const output = await roleService.updateRole({
        uid,
        data,
      });
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
      const output = await roleService.viewRole(uid);
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
      const output = await roleService.deleteRole(uid);
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
      const data = RoleModel.fromUpdateStatusRole(req.body);
      const output = await roleService.updateStatusRole({
        uid,
        data,
      });
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
      const data = RoleModel.searchRole(req.query);
      const output = await roleService.searchRole(data);
      res.json({
        success: true,
        results: { data: output[0], paging: output[1] },
      });
    } catch (error) {
      next(error);
    }
  },
};
