'use strict';
const pino = require('pino');
const serializers = require('pino-std-serializers');
const startTime = Symbol('startTime');
function wrapChild(opts, stream) {
  const prevLogger = opts.logger;
  const prevGenReqId = opts.genReqId;
  let logger = null;

  if (prevLogger) {
    opts.logger = undefined;
    opts.genReqId = undefined;
    logger = prevLogger.child(opts);
    opts.logger = prevLogger;
    opts.genReqId = prevGenReqId;
  } else {
    logger = pino(opts, stream);
  }

  return logger;
}

function reqIdGenFactory(func) {
  if (typeof func === 'function') {
    return func;
  }
  const maxInt = 2147483647;
  let nextReqId = 0;
  return function genReqId(req) {
    return req.id || (nextReqId = (nextReqId + 1) & maxInt);
  };
}
function pinoLogger(opts, stream) {
  if (opts && opts._writableState) {
    stream = opts;
    opts = null;
  }

  opts = opts || {};
  opts.serializers = opts.serializers || {};
  opts.serializers.req = serializers.wrapRequestSerializer(
    opts.serializers.req || serializers.req,
  );
  opts.serializers.res = serializers.wrapResponseSerializer(
    opts.serializers.res || serializers.res,
  );
  opts.serializers.err = opts.serializers.err || serializers.err;

  const theStream = opts.stream || stream;
  delete opts.stream;

  const logger = wrapChild(opts, theStream);
  const genReqId = reqIdGenFactory(opts.genReqId);
  function onResFinished(err) {
    this.removeListener('error', onResFinished);
    this.removeListener('finish', onResFinished);

    const log = this.log;
    const responseTime = Date.now() - this[startTime];
    const format = `${this.req.id} ${this.req.ip} ${this.req.method} ${this.req.path} ${responseTime}ms ${this.statusCode} ${this.statusMessage}`;
    const meta = {
      res: this,
      responseTime: responseTime,
      error: err ? err : undefined,
    };
    switch (true) {
      case this.statusCode < 200:
        log.warn(meta, format);
        break;
      case this.statusCode > 199 && this.statusCode < 300:
        log.info(meta, format);
        break;
      case this.statusCode > 299 && this.statusCode < 500:
        log.warn(meta, format);
        break;
      default:
        log.error(meta, format);
    }
  }

  function loggingMiddleware(req, res, next) {
    req.id = genReqId(req);
    req.log = res.log = logger.child({ req: req });
    res[startTime] = res[startTime] || Date.now();
    if (!req.res) {
      req.res = res;
    }

    res.on('finish', onResFinished);
    res.on('error', onResFinished);

    if (next) {
      next();
    }
  }
  loggingMiddleware.logger = logger;
  return loggingMiddleware;
}

module.exports = pinoLogger;
module.exports.stdSerializers = {
  req: serializers.req,
  res: serializers.res,
};
module.exports.startTime = startTime;
