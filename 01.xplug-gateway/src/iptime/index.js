'use strict';
require('../utils/logger');


var     ping            = require('ping');
const   xpUtils         = require("../utils/xg_datetime");
const   C_AREA          = require('../common_area');

var     adtMqtt         = C_AREA.mqttAdapter 
var     dbSql           = C_AREA.dbSql;
var     dbCmdListener   = C_AREA.dbCmdListener;


var HashMap  = require('hashmap');

class IPTIME_PLUG{

    constructor(){
    this.DEV_NM       = "",          //플러그명  ==  IP
    this.ZB_ADDR      = ""   ;       //플러그ID == ZIGBEE ADDR
    this.SW_ST        = ""   ;       //플러그 상태 

    //Process Info
    this.PING_FAIL_CNT = 0  ;       //연속 실패 횟수         
    }
}


class IPTimeThread 
{

    constructor() 
    {
        this._this  = this;

        this.mapIpTimePlugs = null;

        this.readInterval = 30000;  //30 초주기 체크 
        this.readPlugOfIPTime();

        this.pingInterval = 10000;  //10 초주기 체크 
        this.pingCheck();
    }


    async pingCheck(){

        try
        {
            //핑체크 대상 플러그 없음 
            if( this.mapIpTimePlugs == null || this.mapIpTimePlugs.size  <= 0 ) 
            {        
                console.info("[IPTimeThread  ] IPTime Plug Not Found ! " );    

                setTimeout( ()=> { this.pingCheck() }, this.pingInterval ); //30초 
                return ;
            }



            this.mapIpTimePlugs.forEach( async (val, key) =>{
                                
                
                let pingResult = await ping.promise.probe( val.DEV_NM, {
                    timeout: 10,
                    extra: ['-i', '2'],
                } );

                //PING 성공 
                if( pingResult.alive == true )  
                {
                    console.info(`[IPTimeThread  ] '${pingResult.host }' Ping Success !!`);
                    val.PING_FAIL_CNT = 0;
                }
                else
                {
                    console.error(`[IPTimeThread  ] '${pingResult.host }' Ping Failed !!`);
                    val.PING_FAIL_CNT++;
                }                            

                console.info( `[IPTimeThread  ] ${JSON.stringify(val)} `); 

                //공유기 꺼저 있으면 무조건 켜기 
                if( val.SW_ST == 0 ){
                    this.plugControl(val.ZB_ADDR, 1);  
                }

                //18회이상 == 180초  (3분동안 응답 없을시에 [공유기 부팅시간 감안] )
                if( val.PING_FAIL_CNT >= 18 ){
                    this.plugControl(val.ZB_ADDR, 0);     //OFF 제어 
                    val.PING_FAIL_CNT = 0;
                }               
            });
        }
        catch  ( reason )
        {
            console.error(reason.message);            
        }

        setTimeout( ()=> { this.pingCheck() }, this.pingInterval ); 
    }

    //공유기 플러그 
    plugControl( zb_addr, stat){
        let cmd = (stat == 1) ? "ON" : "OFF";
        console.info( `[IPTimeThread  ] ===================> IPTIME PLUG CONTROL : ${zb_addr} - ${cmd}`);

        let obj = {
            "pkn"  : 1,	            //M=패킷구분  			[0:통보(응답불필요),1:요청(응답요구),2:요청(응답불필요),3:응답 ]	                    
            "cmd"  : cmd,	        //M=명령종류  				
            "tno"  : 0, 	        //M=트랜잭션번호 		
            "data" : [zb_addr]
        };

        adtMqtt.sendMessage( JSON.stringify(obj) );


        // 껏다면 3초후 무조건 ON 
        if( stat == 0 ) 
        {
            setTimeout( ()=> { 
                this.plugControl(zb_addr, 1);  
            }, 3000);    //ON 제어 (3초후) )
        }
    }







































    //공유기 플러그 정보 DB에서 읽기 
    async readPlugOfIPTime()
    {
        try
        {
            let nMapPlugs = new HashMap();
            let ipTimePlugs = await dbSql.selectDeviceIPTime();      //공유기 플러그 조회
            for ( let dev of ipTimePlugs )
            {                
                let ZB_ADDR             = dev['ZB_ADDR'];
                let DEV_NM              = dev['DEV_NM'];
                let SW_ST               = dev['SW_ST'];
                let MANU_CTL_ALLOW      = dev['MANU_CTL_ALLOW'];
                let ZB_ONGRP_AID        = dev['ZB_ONGRP_AID'];
                let ZB_OFFGRP_AID       = dev['ZB_OFFGRP_AID'];


                //전체 제어 거부로 설정 
                if( MANU_CTL_ALLOW != 0 || ZB_ONGRP_AID != 0 || ZB_OFFGRP_AID != 0 ) {                    
                    await dbSql.updateManuCtlAllowDisable( ZB_ADDR );
                    console.info( "UPDATE IPTIME PLUG MANU_CTL_ALLOW DISALBE !!" );
                }

                let tmp  = new IPTIME_PLUG();
                tmp.ZB_ADDR = ZB_ADDR;
                tmp.DEV_NM = DEV_NM;
                tmp.SW_ST  = SW_ST;
                
                tmp.PING_FAIL_CNT  = 0 ;       //연속 실패 횟수     
                
            
                nMapPlugs.set(tmp.ZB_ADDR,  tmp);
            }

            if( this.mapIpTimePlugs == null )
            {
                this.mapIpTimePlugs = nMapPlugs;
                setTimeout( ()=> { this.readPlugOfIPTime() }, this.readInterval ); //30초 
                return;
            }


            nMapPlugs.forEach( (nValue, key) =>{
                
                if( this.mapIpTimePlugs.has( key ) ) {

                    let oValue = this.mapIpTimePlugs.get(key );
                    
                    nValue.PING_FAIL_CNT  = oValue.PING_FAIL_CNT ;       //연속 실패 횟수                    

                }
            });

            this.mapIpTimePlugs = null;
            this.mapIpTimePlugs = nMapPlugs;        //새롭게 적용
            
        }
        catch  ( reason )
        {
            console.error(reason.message);            
        }

        setTimeout( ()=> { this.readPlugOfIPTime() }, this.readInterval ); //30초 

    }
}

module.exports = new IPTimeThread();