'use strict';
const { ulid } = require('ulid');
const bodyParser = require('body-parser');
const express = require('express');
const paypal = require('paypal-rest-sdk');
const fs = require('fs');
const stackTrace = require('stack-trace');
const { defaultsDeep } = require('lodash');
const path = require('path');
const swaggerTools = require('swagger-tools');
const yaml = require('js-yaml');
const cors = require('cors');

const { ErrorModel } = require('../../models');
const { ERROR } = require('../../constants');
const { corsMiddleWare } = require('./middlewares/cors');
const { logger, transport } = require('../../libs/logger');
const { pinoHtttpMiddleware } = require('./middlewares/http_logger');

const bearerRegex = /^Bearer\s/;

/**
 * HttpServer Wrapper
 *
 * @class HttpServer
 */
class HttpServer {
  /**
   * Creates an instance of HttpServer.
   * @param {Object} opts
   */
  constructor(opts = {}) {
    const defaultOpts = {
      port: 3000,
      ignorePath: [],
      queryBlackList: [],
      bodyBlackList: [],
    };
    /** @type {defaultOpts} */
    this.opts = defaultsDeep(opts, defaultOpts);
    this.swaggerOpts = {
      controllers: path.join(__dirname, 'routes/v1'),
      useStubs: false,
    };

    this.app = express();
    this.app.use(cors());
    this.app.enable('case sensitive routing');
    this.app.enable('trust proxy');
    this.app.disable('x-powered-by');
    this.app.disable('etag');
    this.logger = logger;
    this.swaggerDoc = {
      swagger: '2.0',
      paths: {},
      info: {
        version: '1.0.0',
        title: 'swagger',
      },
    };
    this.server = null;

    const url = `${path.join(__dirname, '..', '..', 'docs')}/swagger.yml`;
    try {
      this.swaggerDoc = yaml.safeLoad(fs.readFileSync(url, 'utf8'));
      if (process.env.NODE_ENV === 'development') {
        this.swaggerDoc.host = `127.0.0.1:${this.opts.port}`;
      }
    } catch (err) {
      this.logger.error(err.message, err);
    }

    paypal.configure({
      mode: 'sandbox', //sandbox or live
      client_id:
        'ASqK-_wIOEZ8TNFmwU4urBQSIXpvOSshNVR-uh5vkll4vCTt5dgiifNWXVLb93KY473sbXnEkxnBfWQO',
      client_secret:
        'EFIujFEE8biZZg1nUdJIe-8nwgyVQh64ds0C0-8ckODOd8WGN-ecCHNgZBja-Zce2umgL_JPX8aeiOcr',
    });
  }

  /**
   * Load Swagger and others middlewares. Return Application instance for testing
   *
   * @returns Application
   * @memberof HttpServer
   */
  async loadMiddleWare() {
    const middleware = await new Promise((resolve) => {
      swaggerTools.initializeMiddleware(this.swaggerDoc, (result) => {
        resolve(result);
      });
    });
    this.app.use(corsMiddleWare());
    this.app.use(
      pinoHtttpMiddleware(
        transport,
        new Set(this.opts.ignorePath),
        this.opts.bodyBlackList,
        this.opts.queryBlackList,
      ),
    );

    this.app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
    this.app.use(bodyParser.json({ limit: '50mb' }));
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    this.app.use(middleware.swaggerMetadata());
    // Validate Swagger requests
    this.app.use(middleware.swaggerValidator());
    // Route validated requests to appropriate controller
    this.app.use(middleware.swaggerRouter(this.swaggerOpts));
    // Serve the Swagger documents and Swagger UI
    this.app.use(
      middleware.swaggerUi({
        swaggerUi: '/api/docs',
        apiDocs: '/api/api-doc',
      }),
    );
    this.app.use((req, res, next) => {
      next(ErrorModel.initWithParams({ ...ERROR.VALIDATION.NOT_FOUND }));
    });

    // eslint-disable-next-line no-unused-vars
    this.app.use((err, req, res, next) => {
      const context = res.locals.context;
      if (err != null && err.constructor != null) {
        let ret = ErrorModel.initWithParams({
          ...ERROR.SYSTEM.GENERIC,
          ...(err.message && { message: err.message }),
        });
        if (err.failedValidation) {
          ret = ErrorModel.initWithParams({
            ...ERROR.VALIDATION.SWAGGER_VALIDATION,
          });
          ret.message = err.message;
          ret.meta = err.results;
        } else if (err.allowedMethods) {
          ret = ErrorModel.initWithParams({
            ...ERROR.VALIDATION.NOT_FOUND,
          });
        } else {
          switch (err.constructor.name) {
            case 'ApiError':
              ret = err;
              this.logger.error({ error: err, context }, err.message);
              break;
            default:
              this.logger.error(
                {
                  context,
                  stacks: stackTrace.parse(err),
                },
                err.message,
              );
          }
        }
        /* eslint-disable */
        const { http, statusCode, ...response } = ret;
        res.status(http == null ? ERROR.SYSTEM.GENERIC.http : http);
        res.json(response);
      } else {
        this.logger.error({ error: err, context }, err.message);
        res.status(ERROR.SYSTEM.INTERNAL.http);
        res.json({
          code: ERROR.SYSTEM.INTERNAL.message,
          type: ERROR.SYSTEM.INTERNAL.type,
          message: ERROR.SYSTEM.INTERNAL.message,
        });
      }
    });

    return this.app;
  }
  /**
   * Start server
   */
  async start() {
    await this.loadMiddleWare();
    return this.app;
  }

  /**
   * Stop server
   */
  async stop() {}
}

module.exports = {
  HttpServer: HttpServer,
};
