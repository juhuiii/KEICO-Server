'use strict';

const path = require('path');
const logdir = path.join(process.cwd(), 'log') ;

module.exports = {
    http : {
        port : 9002
    },
    db : {
        host : '169.56.110.168', //Real Cloud Server
        port : '3306',
        user : 'xplug_admin',
        pwd : 'xplug@admin',
        dbname: 'xplug_db'
    },
    log : {
        dir : logdir,
        level : "info" //{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 } ==> error or info
    },
    mqtt_cloud : {
        addr : '169.56.110.163',
        port : 21883,
        id : 'xpia',
        pw : 'sr1234'
    },
};