'use strict';
require('../utils/logger');

const   xpUtils         = require("../utils/xg_datetime");
const   C_AREA          = require('../common_area');

var     adtMqtt         = C_AREA.mqttAdapter = require('./adt_mqtt'); 
var     dbSql           = C_AREA.dbSql;
var     dbCmdListener   = C_AREA.dbCmdListener;


//  require('./thread_watchdog');       //Watchdog Thread  ---> error disable (2020-04-??)

require('./thread_zbgroup');        //Zigbee Group Sync Thread 


/**
 * Adapter MQTT 통신 처리 
 */
class AdapterService  {

    constructor() 
    {
        //아답터 수신 메세지 
        adtMqtt.on('onmessage',  (mqtMsg) => {
            this.onMesssageFromAdapter(mqtMsg.topic, mqtMsg.message);
        } );
        
        //DB명령 수신 메세지 
        dbCmdListener.on( 'oncommand', (dbCmd) => {
            this.onDatabaseCommand( dbCmd );
        } )

        this.DEV_KIND = {
            PLUG        : 1000,         //PLUG unknown maker
            PLUG_EASY   : 1001,         //PLUG EASY 
            SWITCH      : 2000,         //SWITH unknown maker
            SWITCH_EZEX : 2001,         //SWITH eZEX
        }
    }

 

    //MQTT로부터 오는 메세지 처리 
    onMesssageFromAdapter( mqtTopic, mqtMessage )
    {
        console.debug(`[AdapterService] onMessage : '${mqtMessage}'` );
        console.info(`[AdapterService] onMessage : '${mqtMessage}'` );
        
        let jsonMsg = JSON.parse(mqtMessage);     

        switch( jsonMsg.cmd  )
        {
            case 'SC'           :   //Scan Channel
            case 'JOIN_START'   :   //Permit Join Start 
            case 'JOIN_STOP'    :   //Permit Join Stop                
            case 'ON'           :   //Switch ON 
            case 'OFF'          :   //Switch OFF
            case 'DEV_DEL'      :   //Delete Device    
            case 'CTL'          :   //Group ON/OFF or ALL ON/OFF
                dbSql.updateCommandRecvAck(jsonMsg);             // Only Packet kind = 3
                break;
            case 'CH'           :       //Read Channel           //  Packet kind = 3 or 0
                if( jsonMsg.pkn == 3 )  //ACK 응답  :  패킷구분 : [0:통보(응답불필요),1:요청(응답요구),2:요청(응답불필요),3:응답 ]	            
                    dbSql.updateCommandRecvAck(jsonMsg);
                else if ( jsonMsg.pkn == 0 )
                    dbSql.updateCommandRecvData(jsonMsg);
                break;
            case 'ONOFF'        :                               // Packet Kind = 0
            case 'DEV_ADD'      : 
            case 'KW'           : 
            case 'KWH'          :
            case 'GROUP'        :
            case 'READ'         :
                this.recvMeasData(jsonMsg);
                break;                
            default :
                console.error( `unknown command='${jsonMsg.cmd}'` );
        }
        
    }

    
    getDeviceKind( data ){

        
        if(     data["maker"] === undefined 
            ||  data["model"] === undefined
            ||  data["maker"] ==  null
            ||  data["model"] ==  null )
        {
            return this.DEV_KIND.PLUG ;          //기본은 플러그로 인식
        }          

        if( data["maker"] == "EASYSAVER" && data["model"] == "ESP-700Z"  )                
            return this.DEV_KIND.PLUG_EASY;          //기본은 플러그로 인식


        if( data["maker"] == "" && data["model"] === "" )        
            return this.DEV_KIND.SWITCH_EZEX;          //eXEX Swith
                              
        if( data["maker"] == "_TYZB01_8gqspaab" && data["model"] === "TS0003" )        //중국 스위치 
            return this.DEV_KIND.SWITCH;          //China  Switch

        return this.DEV_KIND.PLUG;
    }


    async recvMeasData(msg) {

        if( !msg )  return;

        if ( msg.cmd === "KW" || msg.cmd === "KWH"){     //순시값 수신             
            if( msg.data )
            {
                let  colName = (msg.cmd == "KWH") ? "AKWH" : "KW";
                dbSql.updateDeviceMeas(msg.data.addr64, colName, msg.data.value).then((result) => {
                    if( result.changes == 0 )
                    {
                        let newDev = {};
                        newDev["ZB_ADDR"]   = msg.data.addr64;                        
                        newDev["DEV_NM"]    = msg.data.addr64;
                                                
                        if( msg.cmd === "KWH" ){
                            newDev["AKWH"]  = msg.data.value ;      //W단위 
                        }
                        else {
                            newDev["KW"]     = msg.data.value ;                            
                        }
                        

                        newDev["MANU_CTL_ALLOW"]    = 1;   //수동제어 허용여부 (1:허용, 0:불허)
                        newDev["OFF_DELY"]          = 0;   //OFF시 Delay 초 지연시간 
                        newDev["STBY_KW"]           = 0;   //기준대기전력 (OFF 대기전력 이상 순시전력이 있을경우 OFF하지 않는다.) 

                        newDev["DEV_ST"]    = 1; //상태(1:정상,2:통신이상<연결실패>)
                        newDev["RCV_DT"]    = xpUtils.getCurDate() ; //
                        newDev["RCV_TM"]    = xpUtils.getCurTime(); //
                   
                        newDev["DEV_GB"]    = this.getDeviceKind( msg.data );       //디바이스구분 2020-04-03 추가                         
                        newDev["BIGO"]      = JSON.stringify(msg.data) ;            //버전정보

                        dbSql.insertDevice(newDev).then((result) => {

                        }).catch(function (reason) {
                            console.error( reason )
                        });            
                    }
                }).catch(function (reason) {
                    console.error( reason )
                });            
            }
        }else 
        if( msg.cmd === "ONOFF")    {   //ONOFF 상태수신
            if( msg.data )
            {
                try
                {                
                    let devRow =  await dbSql.selectDevice(msg.data.addr64);

                    if( typeof devRow !== 'object' || devRow.length <= 0 ) 
                    {
                        let newDev = {};
                        newDev["ZB_ADDR"]   = msg.data.addr64;                        
                        newDev["DEV_NM"]    = msg.data.addr64;
                        newDev[msg.cmd]     = msg.data.value ;


                        newDev["MANU_CTL_ALLOW"] = 1;   //수동제어 허용여부 (1:허용, 0:불허)
                        newDev["OFF_DELY"]       = 0;   //OFF시 Delay 초 지연시간 
                        newDev["STBY_KW"]        = 0;   //기준대기전력 (OFF 대기전력 이상 순시전력이 있을경우 OFF하지 않는다.) 
                        
                        newDev["DEV_ST"]    = 1; //상태(1:정상,2:통신이상<연결실패>)
                        newDev["RCV_DT"]    = xpUtils.getCurDate() ; //
                        newDev["RCV_TM"]    = xpUtils.getCurTime(); //                    
                        

                        newDev["DEV_GB"]    = this.getDeviceKind( msg.data );       //디바이스구분 2020-04-03 추가 
                        newDev["BIGO"]      = JSON.stringify(msg.data) ;            //버전정보

                        await dbSql.insertDevice(newDev);                                //스위치 추가 
                        await dbSql.insertSwEvent(msg.data.addr64,  msg.data.value );    //변경이력 
                    }
                    else
                    {
                       
                        if( msg.data.value != devRow[0].SW_ST ) //상태가 바뀌었다면 
                        {
                            let PREV_CHG_DT = devRow[0]["CHG_DT"];  //이전변경일자
                            let PREV_CHG_TM = devRow[0]["CHG_TM"];  //이전변경일시 
                            let PREV_CHG_KW = devRow[0]["CHG_KW"];  //변경시점 전력 

                            let  CUR_DT = parseInt(xpUtils.getCurDate());     //현재시간 
                            let  CUR_TM = parseInt(xpUtils.getCurTime());
                            let  CUR_KW = devRow[0]["KW"];
                            let  BIGO    = JSON.stringify(msg.data) ;            //버전정보

                            let SAVE_KW = 0.0;
                            let SAVE_SEC=0;

                            

                            await dbSql.updateDeviceSwStatChange(msg.data.addr64, msg.data.value, CUR_DT, CUR_TM, CUR_KW, BIGO);  //상태값 변경및 이전상태 저장 

                            if( msg.data.value == 1 && PREV_CHG_KW > 0.0 )       //ON으로 변경되었다면 (절감량 계산)
                            {                         
                                //절감량 계산 
                                let saveSec    = xpUtils.getDiffSec( ((PREV_CHG_DT * 1000000) + PREV_CHG_TM),  ((CUR_DT * 1000000) + CUR_TM) ) ;
                                saveSec = saveSec/1000;
                                let kWPerSec    = (PREV_CHG_KW / 3600.0 );    //초당 절감량 

                                let saveKW      = kWPerSec * saveSec ;
                                await dbSql.insertSwEvent(msg.data.addr64,  msg.data.value,saveKW, saveSec);    //변경이력 
                            }
                            else    //OFF로 변경시
                            {
                                await dbSql.insertSwEvent(msg.data.addr64,  msg.data.value, 0, 0); // 절감량 없음 
                            }
                        }
                        else        //상태가 동일하다면  값만 업데이트 
                        {
                            await dbSql.updateDeviceMeas(msg.data.addr64, "SW_ST", msg.data.value);  //계측값 업데이트 
                        }
                    }
                    devRow = null;
                }
                catch ( reason )
                {
                    console.error( reason )
                }
            }
        }else
        if( msg.cmd === "DEV_ADD")  { //JOIN ANNOUNCE 
            let obj = {};
            obj["BIGO"]   = JSON.stringify(msg.data);            
            obj["RCV_DT"] = xpUtils.getCurDate();
            obj["RCV_TM"] = xpUtils.getCurTime();

            dbSql.updateDevice(obj, msg.data.addr64 ).then((result) => {
                if( result.changes == 0 )
                {
                    let newDev = {}
                    newDev["ZB_ADDR"]   = msg.data.addr64;
                    newDev["DEV_NM"]    = msg.data.addr64;

                    newDev["MANU_CTL_ALLOW"] = 1;   //수동제어 허용여부 (1:허용, 0:불허)
                    newDev["OFF_DELY"]       = 0;   //OFF시 Delay 초 지연시간 
                    newDev["STBY_KW"]        = 0;   //기준대기전력 (OFF 대기전력 이상 순시전력이 있을경우 OFF하지 않는다.) 

                    
                    newDev["DEV_ST"]    = 1; //상태(1:정상,2:통신이상<연결실패>)
                    newDev["RCV_DT"]    = xpUtils.getCurDate() ; //
                    newDev["RCV_TM"]    = xpUtils.getCurTime(); //
                

                    newDev["DEV_GB"]    = this.getDeviceKind( msg.data );       //디바이스구분 2020-04-03 추가 
                    newDev["BIGO"]      = JSON.stringify(msg.data) ;            //버전정보
                    
                    dbSql.insertDevice(newDev).then((result) => {
                    }).catch(function (reason) {
                        console.error( reason )
                    });  
                }
            }).catch(function (reason) {
                console.error( reason )
            });  
        }else 
        if ( msg.cmd === "GROUP" ) {     //그룹확인  
            
            if( msg.data  && msg.data['cmd_mode'] == '2' ) {  // GROUP 조회             

                let obj = {};

                let zb_addr =  msg.data['zb_addr'];
                let groups  = ( msg.data['groups'] && msg.data['groups'].split(",") ) || [] ;
                
                if( groups && groups.length > 0 ) {
                    
                    obj["ZB_RGRP_RID"]      = 0; 
                    obj["ZB_ONGRP_RID"]     = 0; 
                    obj["ZB_OFFGRP_RID"]    = 0; 
                                             
                    for (let grp_id of groups) {

                        if(  grp_id > 1000 &&  grp_id < 2000 ) 
                            obj["ZB_RGRP_RID"] = grp_id;
                        else 
                        if(  grp_id > 2000 &&  grp_id < 3000 ) 
                            obj["ZB_ONGRP_RID"] = grp_id;                    
                        else 
                        if(  grp_id > 3000 &&  grp_id < 4000 ) 
                            obj["ZB_OFFGRP_RID"] = grp_id;   
                    }
                    
                    dbSql.updateDevice(obj, msg.data['zb_addr'] ).then((result) => {                        
                        console.info(`Sync Zigbee Group to DB OK [zb_addr:${zb_addr}, ZB_RGRP_RID:${obj["ZB_RGRP_RID"]}, ZB_ONGRP_RID:${obj["ZB_ONGRP_RID"]}, ZB_OFFGRP_RID:${obj["ZB_OFFGRP_RID"]}]`);

                    }).catch(function (reason) {
                        console.error( reason )
                    });
                }
                else
                {                    
                    obj["ZB_RGRP_RID"] = 0;                    
                    obj["ZB_ONGRP_RID"] = 0;                    
                    obj["ZB_OFFGRP_RID"] = 0;                    
                    obj["RCV_DT"] = xpUtils.getCurDate();
                    obj["RCV_TM"] = xpUtils.getCurTime();

                    dbSql.updateDevice(obj, msg.data['zb_addr'] ).then((result) => {                        
                        console.info(`Remove All Zigbee Group to DB OK [zb_addr:${zb_addr}]`);
                    }).catch(function (reason) {
                        console.error( reason )
                    });
                }
            }
        } 

    }

        

































    //데이터베이스로부터 명령 수신
    onDatabaseCommand ( data )
    {
        console.info(`[AdapterService] onCommand from DB : CMD='${data['CMD_CD']}', PARAM='${data['CMD_PARAM']}'` );
    
        let jsonStr  =  this.dbCmd2Message( data );
        if( jsonStr ) {
    
            data["SND_ST" ] = 1;    //송신처리상태(0:송신대기중,1:송신완료,2::송신실패)
            data["PRCS_ST"] = 1;    //명령처리상태(0:대기중, 1:처리중, 2:완료성공, 3:실패완료)
                                    //응답수신상태(0:응답대기, 1:ACK응답수신완료, 2: Data응답수신완료, 3:응답수신실패)
            
            adtMqtt.sendMessage( jsonStr );
            
            console.info(`Send to Zigbee MSG='${jsonStr}'`);
            
            //전송성공
            dbSql.updateCommandSend(data).then((result) => {
                console.info( "Send OK apply to updateCommandSend" );
            }).catch(function (reason) {
                console.error( reason);
            }); 

        } else {
            
            data["SND_ST"  ] = 1;
            data["PRCS_ST" ] = 3;
            
            //전송실패
            dbSql.updateCommandSend(data).then((result) => {

                console.error( "Send fail apply to updateCommandSend Stat" );
    
            }).catch(function (reason) {
                console.error( reason );
            });
        }
    }



    //데이터베이스 명령 to MQTT Message
    dbCmd2Message( cmd ) {

        let obj = null;        
        switch( cmd.CMD_CD )
        {
            case 'SC'           :   //Scan Channel
            case 'JOIN_START'   :   //Permit Join Start 
            case 'JOIN_STOP'    :   //Permit Join Stop                
            case 'ON'           :   //Switch ON 
            case 'OFF'          :   //Switch OFF
            case 'DEV_DEL'      :   //Delete Device 
            case 'CH'           :   //Read Channel 
                obj = {
                    "pkn"  : 1   ,	            //M=패킷구분  			[0:통보(응답불필요),1:요청(응답요구),2:요청(응답불필요),3:응답 ]	                    
                    "cmd"  : cmd['CMD_CD'],	    //M=명령종류  				
                    "tno"  : cmd['CMD_SQ'], 	//M=트랜잭션번호 		
                    "data" : cmd['CMD_PARAM'] ? cmd['CMD_PARAM'].split(",") : null
                };
                break;
            case 'READ'         :   //Zigbee Group (Add Group or View Group)                
            case 'CTL'          :   //Zigbee Group (Add Group or View Group)                
            case 'GROUP'        :   //Zigbee Group (Add Group or View Group)
                obj = {
                    "pkn"  : 1   ,	            //M=패킷구분  			[0:통보(응답불필요),1:요청(응답요구),2:요청(응답불필요),3:응답 ]	                    
                    "cmd"  : cmd['CMD_CD'],	    //M=명령종류  				
                    "tno"  : cmd['CMD_SQ'], 	//M=트랜잭션번호 		
                    "data" : JSON.parse(cmd['CMD_PARAM'] ) 
                };
                break;            
            default : 
                console.error(`Unkowun Command ${cmd.CMD_CD}`);
        }
        return JSON.stringify(obj);
    }    
}


module.exports = new AdapterService();
