'use strict';

//모듈 또는 OJBECT  공유를 위한 모듈
module.exports = {
    mqttAdapter     : null ,    // MQTT Client for Adapter "adpater/adt_mqtt"
    mqttCloud       : null ,    // MQTT Client for Cloud
    dbSql           : null ,    // dbSql객체      "database/db-sql"
    dbCmdListener   : null ,    // 데이터베이스   "database/db-command"

    webService      : null ,    // 웹(REST)서비스 "web/web_service"
}


  
