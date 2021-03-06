'use strict';
require('../utils/logger');

const   C_AREA          = require('../common_area');

var     dbSql           = C_AREA.dbSql;
var     mqttAdapter     = C_AREA.mqttAdapter ;
var     mqttCloud       = C_AREA.mqttCloud = require("./cld_mqtt");

var     cldMessage      = require("./cld_message");
var     adtMessage      = require("./adt_message");

require('./thread_dbsync');       //Database Sync Thread


class CloudService {

    constructor()
    {
        //아답터 수신 메세지
        mqttAdapter.on('onmessage',  (mqtMsg) => {
            this.onMesssageFromAdapter(mqtMsg.topic, mqtMsg.message);
        });

        //클라우드에서  수신된 메세지
        mqttCloud.on( 'onmessage', (mqtMsg) => {
            this.onMesssageFromCloud(mqtMsg.topic, mqtMsg.message);
        });

        //초기값 동기화
        this.sendInitSync();
    }

    sendInitSync(){
        //클라우드와 최초 동기화
        // "TB_SITE", "TB_DEV", "TB_GROUP", "TB_SCHD", "TB_SCHD_TM" , "TB_HOLIDAY"
        if( mqttCloud.isConnected() == false ) {
            setTimeout( ()=>{
                this.sendInitSync();
            }, 5000);

            return;
        }

        dbSql.dbEventEmit("TB_SITE"    , "TABLE_SYNC");     //TB_SITE    클라우드와 동기화
        dbSql.dbEventEmit("TB_DEV"     , "TABLE_SYNC");     //TB_DEV    클라우드와 동기화
        dbSql.dbEventEmit("TB_GROUP"   , "TABLE_SYNC");     //TB_GROUP  클라우드와 동기화
        dbSql.dbEventEmit("TB_SCHD"    , "TABLE_SYNC");     //TB_SCHD  클라우드와 동기화
        dbSql.dbEventEmit("TB_SCHD_TM" , "TABLE_SYNC");     //TB_SCHD_TM  클라우드와 동기화
        dbSql.dbEventEmit("TB_HOLIDAY" , "TABLE_SYNC");
    }

    //아답터 메세지 수신 처리
    onMesssageFromAdapter(topic, message){

        console.debug(`[CloudService] onMessage from adapter : '${message}'` );

        let result = adtMessage.proc( message );

        let colud_msg = {
            hd : {
                src : "ADAPTER",
                cmd : "ADAPTER"
            },
            bd : result
        };

        // 전송하지 않음.
        // mqttCloud.sendMessage(  JSON.stringify( colud_msg ) );    //클라우드로 전송
    }




    //클라우드 메세지 수신처리
    onMesssageFromCloud(topic, message) {

        console.debug(`[CloudService] onMessage from cloud : '${message}'` );

        cldMessage.proc( message );
    }

}

module.exports = new CloudService();
