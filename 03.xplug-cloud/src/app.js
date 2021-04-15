'use strict';
require('./utils/logger');
const   C_AREA      = require('./common_area');     //Common Objects
C_AREA.database     = require('./database');        //Colud Database

// C_AREA.mqttCloud    = require('./mqtt');            //Colud MQTT Service
// CETER WERB 개발 중 잠시 꺼둡니다.

require("./web");                                   //Start Web Service


//Check Log Level ( { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 } )
console.silly  ('Check Log Level : silly');
console.debug  ('Check Log Level : debug');
console.verbose('Check Log Level : verbose');
console.info   ('Check Log Level : info');
console.warn   ('Check Log Level : warn');
console.error  ('Check Log Level : error');


console.info("Start XPlug Cloud!!");



