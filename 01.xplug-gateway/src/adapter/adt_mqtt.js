'use strict';
require('../utils/logger');
const   EventEmitter    = require('events');
var     mqtt            = require('mqtt');
var     config          = require("config");

const   ADT_MQTT_ADDR   = config.get('mqtt.addr');
const   ADT_MQTT_PORT   = config.get('mqtt.port');
const   ADT_TOPIC_PUB   = config.get('mqtt.topic_pub');     // adapter/gw ==> 목적지/출발지
const   ADT_TOPIC_SUB   = config.get('mqtt.topic_sub');     // gw/#;      ==> 목적지/출발지

/**
 * Adapter MQTT 통신 처리 
 */
class AdapterMqtt extends EventEmitter {

    constructor() {
        
        super();
                
        console.info(`[AdapterMqtt] try connnect to adapter MQTT`);

        this.mqttClient  = mqtt.connect(`mqtt://${ADT_MQTT_ADDR}:${ADT_MQTT_PORT}`);

        this.mqttClient.on('connect',  ( connack ) => {
            console.info(`[AdapterMqtt] adapter MQTT connected OK`);            
            this.mqttClient.subscribe( ADT_TOPIC_SUB );
            console.info(`[AdapterMqtt] adapter MQTT subscribe OK '${ADT_TOPIC_SUB}'`);            
        });

        this.mqttClient.on('close',  () => {
            console.debug(`[AdapterMqtt] adapter MQTT on disconnect`);            
        });

        this.mqttClient.on('disconnect', ( packet ) => {
            console.debug(`[AdapterMqtt] adapter MQTT on disconnect`);            
        });

        this.mqttClient.on('error', (error) => {
            console.debug(`[AdapterMqtt] adapter MQTT on error : ${error}` );            
        });

        this.mqttClient.on('message',  (topic, message) => { 

            console.debug(`[AdapterMqtt] recv from adapter topic : ${topic}` );            
            console.debug(`[AdapterMqtt] recv from adapter mesg  :  ${message}` );
    
            let msgdata = { topic, message };
            this.emit('onmessage', msgdata);
        });
    }

    

    //Adapter로 메세지 전송 
    sendMessage( message ){

        console.debug(`[AdapterMqtt] send to adapter topic : ${ADT_TOPIC_PUB}` );
        console.debug(`[AdapterMqtt] send to adapter mesg  : ${message}` );

        console.info(`Send to Zigbee MSG='${message}'`);

        this.mqttClient.publish(ADT_TOPIC_PUB , `${message}`);
    }
}

module.exports = new AdapterMqtt();