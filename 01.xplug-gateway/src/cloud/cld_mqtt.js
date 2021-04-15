'use strict';
require('../utils/logger');


const   EventEmitter    = require('events');
var     mqtt            = require('mqtt');
var     config          = require("config");
var     utils           = require("../utils/xg_datetime");
const   C_AREA          = require('../common_area');

var     dbSql           = C_AREA.dbSql;
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
  
        this.useCloud = false;    //클라우드 사용여부 

        this.checkCloudConfig();
    }

    
     //클라우드 설정 (클라우드ID/게이트웨이ID) 체크 
     async checkCloudConfig(){

        try{
            let rows            = await dbSql.selectSite();

            let cloud_id        = rows[0]["CLOUD_ID"];
            let gateway_id      = rows[0]["GATEWAY_ID"]; 

            if( utils.isNotEmpty( cloud_id ) && utils.isNotEmpty( gateway_id ) )
            {
                if( cloud_id != this.colud_id || gateway_id != this.gateway_id ){                    
                    this.disconnectMqtt();
                }
                this.colud_id   = cloud_id;
                this.gateway_id = gateway_id;
             
                this.useCloud = true;
                this.connectMqtt();
            }
            else
            {
                this.useCloud = false;
                this.disconnectMqtt();
            }

        }catch( reason )
        {
            console.error("[CloudMqtt] " + reason.message); 
        }   
        
        setTimeout( ()=>{ 
            this.checkCloudConfig();
        }, 10000);
    }


    isUseCloud(){
        return this.useCloud;
    }
     
    /**
     * 클라우드 메세지 수신 및 처리로직 
     */
    connectMqtt(){
        
        console.info(`[CloudMqtt] try connnect to cloud MQTT`);

        if( this.mqttClient != null && this.mqttClient.connected  ) {
            console.info("[CloudMqtt] cloud MQTT already connected");            
            return;
        }
        
        this.mqttClient     = mqtt.connect(`mqtt://${CLD_MQTT_ADDR}:${CLD_MQTT_PORT}`, {username: CLD_MQTT_ID, password:CLD_MQTT_PW});

        this.topic_pub      = `cloud/${this.colud_id}/${this.gateway_id}`;    //cloud/{cloud_id}/{gateway_id} ==> 목적지/출발지 //set by function of checkCloudId
        this.topic_sub      = `${this.colud_id}/${this.gateway_id}/#`;        //{cloud_id}/{gateway_id}/#;    ==> 목적지/출발지 //set by function of checkCloudId

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

    //클라우드 MQTT 접속취소
    disconnectMqtt(){        
        if( this.mqttClient == null ||  this.mqttClient.connected == false ) {
            console.debug("[CloudMqtt] cloud MQTT already disconnect");
            this.mqttClient = null;
            return;
        }        

        this.mqttClient.end();
        this.mqttClient = null;        
        console.debug("[CloudMqtt] cloud MQTT disconnect");
    }
    

    //연결 여부 확인 
    isConnected(){
        if( this.mqttClient ) 
            return true;
        
        return false;
    }




    //Cloud 로 메세지 전송 
    sendMessage( message ){

        if( this.mqttClient ) {
            
            this.mqttClient.publish(this.topic_pub , `${message}`);
            console.debug(`[CloudMqtt   ] send to cloud topic : ${this.topic_pub }` );
            console.debug(`[CloudMqtt   ] send to cloud mesg  : ${message}`);
            return true;
        }
        else
        {
            console.info(`[CloudMqtt   ] colud was not connecting `);
            return false;
        }
    }
}

module.exports = new CloudMqtt();