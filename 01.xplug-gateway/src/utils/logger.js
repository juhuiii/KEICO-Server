
'use strict';
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('config');
const format = require('util').format;

class CustomFormatter {
  transform(info) {
    const level = info.level.toUpperCase().padEnd(7, ' ');
    info.message = `${info.timestamp} ${level}: ${info.message}`;
    return info;
  }
}

const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
});

const logger = winston.createLogger({
  level : config.get("log.level"),
  transports: [    
     new winston.transports.Console({   
          format: winston.format.combine(
                timestampFormat,
                new CustomFormatter(),
                winston.format.colorize({
                  all: true,
                  colors: {
                    debug: 'white',
                    info: 'dim white',
                    warn: 'yellow',
                    error: 'red',
                  },
                }),
                winston.format.printf((info) => info.message)
          ),
    }),
    new DailyRotateFile({
      dirname: config.get("log.dir"),
      filename: 'xplug-gateway.log',
      zippedArchive: false,
      //maxSize: '10m',
      maxSize: '1m',
      maxFiles: 10,
      format: winston.format.combine(
        timestampFormat,
        new CustomFormatter(),
        winston.format.printf((info) => info.message)
      ),
    })
  ]
});


if (!console.constructor.hooked)  {  

  console.constructor.hooked = true;

  const FUNCS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

  for (const func of FUNCS) {
    console[func] = function() {
      logger[func](format.apply(null, arguments));      
    };
  }
 
  console.log (`Log Level      = ${config.get("log.level")}`);
  console.log (`Log Directory  = ${config.get("log.dir")}`);    
}
