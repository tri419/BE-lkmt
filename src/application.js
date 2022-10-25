'use strict';
require('dotenv').config();
const httpServer = require('http');
const { config } = require('./libs/configuration');
const { logger, loggerService } = require('./libs/logger');
const { Utils } = require('./libs/utils');
const {
  initMongoose,
  //   initRedisClient,
  //   initMailClient,
  //   initSNSAWSClient,
  //   getMessagesAWS,
} = require('./infrastructures');

// Bootstrap the application
(async () => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const port = Utils.getInteger(
      config.port,
      Utils.getInteger(process.env.PORT, 3000),
    );

    logger.info('Booting');
    process.env.ENV_RAPID7 === 'dev' ? loggerService.info('Booting') : null;
    //mongoose
    await initMongoose();
    // //SNS AWS
    // await initSNSAWSClient();
    // //redis
    // await initRedisClient();
    // //mail
    // await initMailClient();

    logger.info('...');
    logger.info('System all green');

    // Start Http and websocket
    const { HttpServer } = require('./transports/http/server');
    const server = httpServer.createServer(
      await new HttpServer(config.http).start(),
    );

    server.listen(port, () => {
      logger.info('Your HTTP Server is listening on port %d', port);
    });

    //Get messenger AWS
    // await getMessagesAWS();

    process.on('unhandledRejection', (reason) => {
      logger.error(`unhandledRejection: ${reason}`);
    });
    process.on('uncaughtException', (err) => {
      logger.error(err, err.message);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received.');
      logger.info('Closing http server.');
      server.close(() => {
        logger.log('Http server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received.');
      logger.info('Closing http server.');
      server.close(() => {
        logger.info('Http server closed.');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error(err, err.message);
    setTimeout(() => {
      logger.info('Boot failed. Process will be stopped');
    }, 3000);
  }
})();
