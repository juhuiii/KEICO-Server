'use strict';

const path = require('path');
const sqlite3file = path.join(process.cwd(), 'data', 'sqlite3.db' ) ;
const logdir = path.join(process.cwd(), 'log') ;

module.exports = {
    database : {
        file : sqlite3file
    },
    http : {
        port : 80
    },
    mqtt : {    //Adapter <-> Gateway
        addr : '192.168.0.200', //dev_server
        // addr : '192.168.0.201', //gateway
        // addr : '192.168.0.202', //gateway
        // addr : '127.0.0.1',
        port : 1883,
        topic_pub : 'adapter/gw',
        topic_sub : 'gw/#',
    },
    default : {
        siteName : '현장명',
        managerPassword : '1111',
        operatorPassword : '1111'
    },
    log : {
        dir : logdir,
        level : "debug" //{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 } ==> error or info
    },
    mqtt_cloud : {  // Gateway <-> cloude
        addr : 'data.keico.co.kr',
        port : 21883,
        id : 'xpia',
        pw : 'sr1234'
    },
};