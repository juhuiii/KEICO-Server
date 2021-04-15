
'use strict';
require('../utils/logger');

const   C_AREA          = require('../common_area');
var     webService      = C_AREA.webService;
var     network         = require('network');
var     wifi            = require("node-wifi-scanner");
var     mqttCloud       = C_AREA.mqttCloud;

// 클라우드에서 받은 메세지 처리 로직 
class CloudMessage {
    
    constructor(){}

     
    async proc( message ){
        
        let cldMsg = JSON.parse(message);
        let cmd  = cldMsg["hd"]["cmd"];

        console.info( `proc colud message(cmd=${cmd})` );

        let rtn ;
        
        switch ( cmd ){
            case "ON"           : { //개별제어 ON
                rtn = await this.plugOn( cldMsg );
                break;
            }
            case "OFF"          : { //개별제어 OFF                
                rtn = await this.plugOff( cldMsg );
                break;
            }
            case "ALL_ON"       : { //전체제어 ON
                rtn = await this.plugAllOn( cldMsg );
                break;
            }            
            case "ALL_OFF"      : { //전체제어 OFF
                rtn = await this.plugAllOff( cldMsg );
                break;                
            }
            case "GROUP_ON"     : { //그룹제어 ON
                rtn = await this.plugGroupOn( cldMsg );
                break;
            }            
            case "GROUP_OFF"    : { //그룹제어 OFF
                rtn = await this.plugGroupOff( cldMsg );
                break;                
            }
            case "EDT_DEV"    : { //플러그 수정
                rtn = await this.udtDevice( cldMsg );
                break;                
            }
            case "DEL_DEV"    : { //플러그 삭제
                rtn = await this.delDevice( cldMsg );
                break;
            }
            case "ADD_GROUP"    : { //그룹 등록
                rtn = await this.insGroup( cldMsg );
                break;                
            }
            case "EDT_GROUP"    : { //그룹 수정
                rtn = await this.udtGroup( cldMsg );
                break;
            }
            case "DEL_GROUP"    : { //그룹 삭제
                rtn = await this.delGroup( cldMsg );
                break;
            }
            case "ADD_HOLI"    : { //휴일 등록
                rtn = await this.insHoliday( cldMsg );
                break;                
            }
            case "EDT_HOLI"    : { //휴일 수정
                rtn = await this.udtHoliday( cldMsg );
                break;
            }
            case "DEL_HOLI"    : { //휴일 삭제
                rtn = await this.delHoliday( cldMsg );
                break;
            }           
            case "ADD_SCHD_ONCE"  : { //스케쥴 동시 등록
                rtn = await this.insScheduleOnce( cldMsg );
                break;                
            }       
            case "DEL_SCHD_ONCE"  : { //스케쥴 동시 삭제
                rtn = await this.delScheduleOnce( cldMsg );
                break;
            }
            case "FIND_CHANNEL"  : { //ZB 채널검색 
                rtn = await this.findZBChannel( cldMsg );
                break;
            }
            case "PERMIT_JOIN"  : { //퍼밋 조인  
                rtn = await this.permitJoin( cldMsg );
                break;
            }
            case "REPORT_CONFIG"  : { //퍼밋 조인  
                rtn = await this.setReportConfig( cldMsg );
                break;
            }
            case "NWK_ADDR"    : { //16Bit Addr 요청 
                rtn = await this.getGet16BitAddr( cldMsg );
                break;
            }
            case "ZB_GROUP_RESET"   : { // ZB 그룹 리셋                
                rtn = await this.zbGroupReset( cldMsg );
                break;
            }
            case "DEV_NAME_INIT"    : { // 디바이스명 초기화 
                rtn = await this.devNameInit( cldMsg );
                break;
            }
            case "WIFI_SCAN"        : { // Wifi 목록
                rtn = await this.scanWifi( cldMsg );
                break;
            }
            case "NET_SCAN"         : { // Network Interface 목록 
                rtn = await this.scanNet( cldMsg );
                break;
            }
            case "WIFI_FILE_READ"   : { // Wifi 설정파일 읽음 
                rtn = await this.readWifiFile( cldMsg );
                break;
            }
            case "NET_FILE_READ"   : {  // network 설정파일 읽음 
                rtn = await this.readNetFile( cldMsg );
                break;
            }
            case "WIFI_FILE_SET"   : {  // Wifi 설정파일 쓰기
                rtn = await this.writeWifiFile( cldMsg );
                break;
            }
            case "NET_FILE_SET"   : {   // Wifi 설정파일 쓰기 
                rtn = await this.writeNetFile( cldMsg );
                break;
            }
            default : {
                console.error( `unknown command(${cmd}) of cloud message`);
            }
        }
        return rtn;
    }

    

    //개별 ON 
    async plugOn( cldMsg ){

        let result = { rcd : 0, rms : "" };

        let zb_addr     = cldMsg["bd"]["dev_id"];           
        let ctl_type    = 11;                      //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)

        let filter = await webService.plugOn(zb_addr, ctl_type);
       
        let manuFilterMsg = "";
        if( filter.maun_ctl_allow_filter.length > 0 )
            manuFilterMsg = `수동제어 불가(${filter.maun_ctl_allow_filter.length})`;

        if( filter.direct_control.length <= 0 )
        {
            result.rcd = 1;
            result.rms = `ON제어할 기기를 찾지 못했습니다. ${manuFilterMsg} `;
            return result; 
        }

        let totControlCnt = filter.direct_control.length ;        //제어된 갯수 
        let totExceptCnt  = filter.maun_ctl_allow_filter.length   //예외된 갯수
        result.rcd = 0;
        result.rms = `${totControlCnt}개의 기기를 ON하였습니다. 예외기기=${totExceptCnt}`;

        return result;
    }


    //개별 OFF
    async plugOff( cldMsg ){

        let result = { rcd : 0, rms : "" };  

        let zb_addr = cldMsg["bd"]["dev_id"];
        let stdkw_filter  = cldMsg["bd"]["filter"];        
        let ctl_type = 11;                  //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)

        let filter = await webService.plugOff( zb_addr, stdkw_filter,  ctl_type);
         
        let manuFilterMsg = "";
        if( filter.maun_ctl_allow_filter.length > 0 )
            manuFilterMsg = `수동제어 불가(${filter.maun_ctl_allow_filter.length})`;    
        
        let useKwFilterMsg = "";
        if( filter.use_kw_filter.length > 0 )
            useKwFilterMsg = `사용중(${filter.use_kw_filter.length})`;
        
        if( filter.direct_control.length <= 0 && filter.reserv_control.length <= 0 )    //제어된 플러그가 없는경우 
        {            
            result.rcd = 1;
            result.rms = `OFF 가능한 기기가 아닙니다. ${useKwFilterMsg},${manuFilterMsg}`;
            return result;
        }

        let totControlCnt = filter.direct_control.length + filter.reserv_control.length;        //제어된 갯수 
        let totExceptCnt  = filter.maun_ctl_allow_filter.length + filter.use_kw_filter.length;  //예외된 갯수(수동제어불허, 대기전력 체크)
                
        result.rcd = 0;
        result.rms = `${totControlCnt}개의 기기를 OFF 하였습니다. 예외기기=${totExceptCnt}`;

        return result;
    }


    //전체 ON
    async plugAllOn( cldMsg ){
        
        let result = { rcd : 0, rms : "" };
        
        let ctl_type = 11; //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)
        let onGroupDevs = await webService.plugAllOn( ctl_type );

        if( onGroupDevs.length <= 0 )
        {   
            result.rcd = 1;
            result.rms = `Zigbee ON Group을 찾지 못했습니다.`;
            return result; 
        }      

        result.rcd = 0;
        result.rms = `${onGroupDevs.length }개의 플러그를 ON하였습니다.`; 
        return result;
    }

    //전체 OFF
    async plugAllOff( cldMsg ) {
                
        let result = { rcd : 0, rms : "" };

        let stdkw_filter  = cldMsg["bd"]["filter"];
        let ctl_type = 11; //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)

        let offGroupDevs = await webService.plugAllOff( stdkw_filter,  ctl_type );
        
        if( offGroupDevs.length <= 0 )
        {                 
            result.rcd = 1;   
            result.rms = `Zigbee OFF Group Dev 을 찾지 못했습니다.`;
            return result; 
        }               

        result.rcd = 0;
        result.rms = `${offGroupDevs.length }개의 플러그를 OFF하였습니다.`; 
        return result; 
    }

    //그룹 ON
    async plugGroupOn( cldMsg ){
            
        let result = { rcd : 0, rms : "" };

        let grp_sq = cldMsg["bd"]["grp_sq"];        
        let onGroupDevs = await webService.groupOn( grp_sq );

        if( onGroupDevs.length <= 0 )
        {   
            result.rcd = 1;
            result.rms = `Zigbee ON Group을 찾지 못했습니다.`;
            return result; 
        }      

        result.rcd = 0;
        result.rms = `${onGroupDevs.length }개의 플러그를 ON하였습니다.`; 
        return result;
    }

    //그룹 OFF
    async plugGroupOff( cldMsg ) {
                
        let result = { rcd : 0, rms : "" };

        let filter  = cldMsg["bd"]["filter"];
        let grp_sq = cldMsg["bd"]["grp_sq"];
        
        let offGroupDevs = await webService.groupOff( grp_sq,  filter );
        
        if( offGroupDevs.length <= 0 )
        {                 
            result.rcd = 1;   
            result.rms = `Zigbee OFF Group Dev 을 찾지 못했습니다.`;
            return result; 
        }               

        result.rcd = 0;
        result.rms = `${offGroupDevs.length }개의 플러그를 OFF하였습니다.`; 
        return result; 
    }
    
    


    //플러그 수정
    async udtDevice( cldMsg ){

        let ZB_ADDR = cldMsg["bd"]["ZB_ADDR"] ;             
        delete cldMsg["bd"]["ZB_ADDR"]; 
        
        let bdParam = {
            DEV_NM          : cldMsg["bd"]["DEV_NM"],
            DEV_GB          : cldMsg["bd"]["DEV_GB"] ,
            STBY_KW         : cldMsg["bd"]["STBY_KW"],
            OFF_DELY        : cldMsg["bd"]["OFF_DELY"] ,
            MANU_CTL_ALLOW  : cldMsg["bd"]["MANU_CTL_ALLOW"],
            GRP_SQ          : cldMsg["bd"]["GRP_SQ"]
        }

        if( bdParam["MANU_CTL_ALLOW"] == 0 ) {   //전체제어 허용여부 {허용안하는경우 ON/OFF Zigbee그룹에서 제외 }
            bdParam["ZB_ONGRP_AID"]  = 0;
            bdParam["ZB_OFFGRP_AID"] = 0;
        }
    
        if( bdParam["OFF_DELY"] > 0 )    //OFF지연값 설정시 OFF Zigbee그룹에서 제외        
        bdParam["ZB_OFFGRP_AID"] = 0;
                               
        let rtn = await webService.udtDevice(ZB_ADDR, bdParam);

        return rtn;
    }
        
    //플러그 삭제
    async delDevice( cldMsg ){
        let ZB_ADDR = cldMsg["bd"]["zb_addr"] ; 
        let rtn = await webService.delDevice(ZB_ADDR);
        return rtn;
    }
        
        
    //그룹 등록
	async insGroup( cldMsg ){          
        
        let bdParam = {
            GRP_NM: cldMsg["bd"]["GRP_NM"] ,
            BIGO: cldMsg["bd"]["BIGO"] };

        let rtn = await webService.insGroup( bdParam );
        return rtn;
	}
	
	//그룹 수정
	async udtGroup( cldMsg ){

        let GRP_SQ = cldMsg["bd"]["GRP_SQ"] ; 
            
        let bdParam = {
            GRP_NM: cldMsg["bd"]["GRP_NM"] ,
            BIGO: cldMsg["bd"]["BIGO"] 
        };
        
        let rtn = await webService.udtGroup(GRP_SQ, bdParam);
        return rtn;        
	}
	
	//그룹 삭제
	async delGroup( cldMsg ){

        let GRP_SQ = cldMsg["bd"]["GRP_SQ"];        
        let rtn = await webService.delGroup(GRP_SQ);
        return rtn;
    }
    
    	
	//휴일 등록
	async insHoliday( cldMsg ){
        
        let bdParam = {
            HOLI_NM: cldMsg["bd"]["HOLI_NM"] ,
            HOLI_DT: cldMsg["bd"]["HOLI_DT"] 
        };

        let rtn = await webService.insHoliday(bdParam);
        return rtn;
	}
	
	//휴일 수정
	async udtHoliday( cldMsg ){        
        let HOLI_DT = cldMsg["bd"]["HOLI_DT"] ; 

        let bdParam = {
            HOLI_NM: cldMsg["bd"]["HOLI_NM"] 
            };

        let rtn = await webService.udtHoliday(HOLI_DT, bdParam);

        return rtn;
    }    
	
	//휴일 삭제
	async delHoliday( cldMsg ){
        let HOLI_DT = cldMsg["bd"]["HOLI_DT"];        
        let rtn = await webService.delHoliday(HOLI_DT);
        return rtn;
	}
	
	// //스케쥴 등록
	// async insSchedule( cldMsg ){
    //     let rtn = await webService.insSchedule(cldMsg["bd"]);
    //     return rtn;
	// }
	
	// //스케쥴 수정
	// async udtSchedule( cldMsg ){
    //     let SCHD_SQ = cldMsg["bd"]["SCHD_SQ"] ; 
            
    //     delete cldMsg["bd"]["SCHD_SQ"]; 
    //     let rtn = await webService.udtSchedule(SCHD_SQ, cldMsg["bd"]);

    //     return rtn;
	// }
	
	// //스케쥴 삭제
	// async delSchedule( cldMsg ){
    //     let SCHD_SQ = cldMsg["bd"]["SCHD_SQ"];        
    //     let rtn = await webService.delSchedule(SCHD_SQ);
    //     return rtn;
	// }
	
	// //시간스케쥴 등록
	// async insScheduleTime( cldMsg ){
    //     let rtn = await webService.insScheduleTime(cldMsg["bd"]);
    //     return rtn;
	// }
	
	// //시간스케쥴 수정
	// async udtScheduleTime( cldMsg ){
    //     let SCHD_TM_SQ = cldMsg["bd"]["SCHD_TM_SQ"] ; 
            
    //     delete cldMsg["bd"]["SCHD_TM_SQ"]; 
    //     let rtn = await webService.udtScheduleTime(SCHD_TM_SQ, cldMsg["bd"]);

    //     return rtn;
	// }
	
	// //시간스케쥴 삭제
	// async delScheduleTime( cldMsg ){
    //     let SCHD_TM_SQ = cldMsg["bd"]["SCHD_TM_SQ"];        
    //     let rtn = await webService.delScheduleTime(SCHD_TM_SQ);
    //     return rtn;
	// }
	
	//스케쥴 동시 등록
	async insScheduleOnce( cldMsg ){

        let schdBd = {
            GRP_SQ : cldMsg["bd"]["GRP_SQ"],
            SCHD_NM : cldMsg["bd"]["SCHD_NM"],
            WEEK_BIT : cldMsg["bd"]["WEEK_BIT"], 
            HOLI_YN : cldMsg["bd"]["HOLI_YN"], 
            BIGO : cldMsg["bd"]["BIGO"]
        };               
        let rtn = await webService.insSchedule( schdBd );
        
        
        let schdTmBd = {
            SCHD_SQ : rtn["lastID"]  ,
            CTL_TIME : cldMsg["bd"]["CTL_TIME"],
            CTL_CMD : cldMsg["bd"]["CTL_CMD"]
        };
        rtn = await webService.insScheduleTime(schdTmBd);
        return rtn;
	}
	
	//스케쥴 동시 삭제
	async delScheduleOnce( cldMsg ){
        let SCHD_SQ = cldMsg["bd"]["SCHD_SQ"];

        let rtn = await webService.delSchedule( SCHD_SQ );
        return rtn;
	}
	
	//ZB 채널검색 
	async findZBChannel( cldMsg ){

        await webService.findZBChannel();
        return;

	}
	
	//퍼밋 조인  
	async permitJoin( cldMsg ){
        let SEC = cldMsg["bd"]["sec"];
        await webService.permitJoin( SEC );
        return;
	}
	
	//Report Config
	async setReportConfig( cldMsg ){

        let param = {};
        param["ZB_ADDR"] = cldMsg["bd"]["zb_addr"];       //64 bit Address 
        param["KIND"]    = cldMsg["bd"]["knd"]    ;       //KIND  0(ON/OFF),  1(KW) ,2(KWH)
        param["MIN"]     = cldMsg["bd"]["min"]    ;       //min
        param["MAX"]     = cldMsg["bd"]["max"]    ;       //max 
        param["VAL"]     = cldMsg["bd"]["val"]    ;       //change value  
                 
        await webService.setReportConfig( param );                                       
                
        return;
	}
	
	//16Bit Addr 요청 
	async getGet16BitAddr( cldMsg ){
        let zb_addr = cldMsg["bd"]["zb_addr"]; 
        await webService.getGet16BitAddr( zb_addr );
        return;
	}
    
        
	// ZB 그룹 리셋                
	async zbGroupReset( cldMsg ){

        await webService.zbGroupReset();
        return;
	}
	
	// 디바이스명 초기화 
	async devNameInit( cldMsg ){
        let ignore_pre_set = cldMsg["bd"]["ignore_pre_set"]; 
        webService.initDevName( ignore_pre_set );
        return;
	}
	
	// Wifi 목록
	async scanWifi( cldMsg ){

        network.get_interfaces_list( (err, list) => {            
            this.sendToCloud( "WIFI_SCAN", 0,  list);
        });

        return;
    }
    
	
	// Network Interface 목록 
	async scanNet( cldMsg ){
     
        wifi.scan( (err, wifis) => {
            if ( err ) {                
                this.sendToCloud( "NET_SCAN", 1,  reason.message ); 
            }
            else
            {
                console.log(wifis);
                this.sendToCloud( "NET_SCAN", 0,  wifis);             
            }
        });
	}
	
	// Wifi 설정파일 읽음 
	async readWifiFile( cldMsg ){
        
        let ifstr = webService.readWifiFile();
        this.sendToCloud( "WIFI_FILE_READ", 0,  ifstr);    

        return;
	}
	
	// network 설정파일 읽음 
	async readNetFile( cldMsg ){

        let ifstr = webService.readNetFile();
        this.sendToCloud( "NET_FILE_READ", 0,  ifstr);    

        return;
    }
    
	
	// Wifi 설정파일 쓰기
	async writeWifiFile( cldMsg ){

        let body = cldMsg["bd"];
        webService.writeWifiFile( body );

        return;
	}
	
	// network 설정파일 쓰기 
	async writeNetFile( cldMsg ){
        
        let body = cldMsg["bd"];
        webService.writeNetFile( body );

        return;
    }
    

    sendToCloud( cmd, sts,  data ) {
        let colud_msg = {
            hd : {
                src         : "GATEWAY", 
                cmd         : cmd      ,
                sts         : sts          
            },
            bd : data
        };

        return mqttCloud.sendMessage(  JSON.stringify( colud_msg ) );
    }
}


module.exports = new CloudMessage();