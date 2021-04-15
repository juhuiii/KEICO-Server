'use strict';

// Start Load Modules
var mqttCloud      = require('./cld_mqtt');
var adtMessage     = require('./adt_message');
var gtwMessage     = require('./gtw_message');

class GatewayService
{

    constructor() 
    {
        //Gateway로 부터 데이터 수신 
        mqttCloud.on( 'onmessage', (mqtMsg) => {
            this.onMesssageFromGateway(mqtMsg.topic, mqtMsg.message);
        });
    }


    //Gateway로 부터 수신된 메세지 
    onMesssageFromGateway(topic, message){
        console.debug(`[GatewayService] onMessage from gateway : '${topic}'` );
        console.debug(`[GatewayService] onMessage from gateway : '${message}'` );

        let split = topic.split("/");
        let ste_id = split[1];
        let gtw_id = split[2];

        let jsonMsg = JSON.parse(message);

        try{
            if( jsonMsg.hd.src == "ADAPTER" || jsonMsg.hd.cmd ==  "ADAPTER")  //아답터에서 발생한 메세지 
            {            
                adtMessage.proc(ste_id, gtw_id, jsonMsg );
            }
            else if( jsonMsg.hd.src == "GATEWAY" ) 
            {
                gtwMessage.proc(ste_id, gtw_id, jsonMsg );
            }
            else
            {
                console.error(`[GatewayService] unknwon src  : '${jsonMsg.hd.src }'` );
            }
        }catch(err){
            console.error( err );
            throw err;
        }
    }


    

    sendMessage( topic_pub, message ){

        mqttCloud.sendMessage(topic_pub, message);

    }

}

module.exports = new GatewayService();