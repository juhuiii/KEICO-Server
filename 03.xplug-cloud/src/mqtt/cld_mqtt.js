'use strict';
require('../utils/logger');


const   EventEmitter    = require('events');
var     mqtt            = require('mqtt');
var     config          = require("config");

const   CLD_MQTT_ADDR   = config.get('mqtt_cloud.addr');        //MQTT Address
const   CLD_MQTT_PORT   = config.get('mqtt_cloud.port');        //MQTT Port
const   CLD_MQTT_ID     = config.get('mqtt_cloud.id') || '' ;   //MQTT Id
const   CLD_MQTT_PW     = config.get('mqtt_cloud.pw') || '';     //MQTT Password


/**
 * Cloud MQTT 통신 처리 
 */
class CloudMqtt extends EventEmitter {

    // this.colud_id   
    // this.gateway_id 
    
    constructor() {  
        
        super();  

        console.info( "[CloudMqtt] Startup...");
  
        this.connectMqtt()
    }


     
    /**
     * 클라우드 메세지 수신 및 처리로직 
     */
    connectMqtt(){
        
        this.mqttClient     = mqtt.connect(`mqtt://${CLD_MQTT_ADDR}:${CLD_MQTT_PORT}`, {username: CLD_MQTT_ID, password:CLD_MQTT_PW});

        this.topic_sub      = `cloud/#`;        //could/{cloud_id}/{gateway_id};    ==> 목적지/출발지 //set by function of checkCloudId
       

        this.mqttClient.on('connect',  ( connack ) => {
            console.info(`[CloudMqtt] cloud MQTT Connected OK`);
            console.info(`[CloudMqtt] cloud MQTT subscribe '${this.topic_sub}'`);            
            this.mqttClient.subscribe( this.topic_sub );
        });

        this.mqttClient.on('close',  () => {
            console.info(`[CloudMqtt] cloud MQTT on disconnect`);            
        });

        this.mqttClient.on('disconnect', ( packet ) => {
            console.info(`[CloudMqtt] cloud MQTT on disconnect`);            
        });

        this.mqttClient.on('error', (error) => {
            console.info(`[CloudMqtt] cloud MQTT on error : ${error}` );            
        });
 
        this.mqttClient.on('message',   (topic, message) =>{

            console.debug(`[CloudMqtt] recv from cloud topic : ${topic}` );            
            console.debug(`[CloudMqtt] recv from cloud mesg  : ${message}` );

            let msgdata = { topic, message };
            this.emit('onmessage', msgdata);
        });
    }

       




    //Cloud 로 메세지 전송 
    sendMessage( topic_pub, message ){

        if( this.mqttClient ) {
            
            this.mqttClient.publish(topic_pub , `${message}`);
            console.debug(`[CloudMqtt   ] send to cloud topic : ${topic_pub }` );
            console.debug(`[CloudMqtt   ] send to cloud mesg  : ${message}` );
        }
        else
        {
            console.info(`[CloudMqtt   ] colud was not connecting `);
        }
    }
}

module.exports = new CloudMqtt();