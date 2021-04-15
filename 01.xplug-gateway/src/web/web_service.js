const C_AREA  = require('../common_area');

var dbSql               = C_AREA.dbSql;


var     xpUtils         = require("../utils/xg_datetime");

const   EventEmitter    = require('events');
var     util            = require('util');
var     os              = require('os');
var     exec            = util.promisify(require('child_process').exec);
var     fs              = require('fs');

const DEBUG = false;


class WebService extends EventEmitter {

    constructor( mqtt ){  
        super();

        this.mqttAdapter = C_AREA.mqttAdapter;
    }


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////    USER FUNCTIONS  ////////////////////////////
    ////////////////////////////    USER FUNCTIONS  ////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // 지그비 채널 검색 
    async findZBChannel() {        
        let CMD = "SC";
        let CMD_PARAM = "";
        await dbSql.insertCommand(CMD, CMD_PARAM);        //즉시제어
                
        return;
    }

    // 지그비 퍼밋 조인 
    async permitJoin( SEC ) { 

        let CMD = "";   
        let CMD_PARAM  = "";

        if( !isNaN(Number(SEC)) && Number(SEC) > 0 ){
            CMD = "JOIN_START";
            CMD_PARAM = SEC;
        }else {
            CMD = "JOIN_STOP";
            CMD_PARAM = 0;
        }
        await dbSql.insertCommand(CMD, CMD_PARAM); 
        return;
    }

    //Zigbee Report Config 설정 
    async setReportConfig( param ){

        let CMD = "CONFIG";         
        let set_param = `{"zb_addr":"${ param.ZB_ADDR }", "kind": ${ param.KIND }, "min": ${ param.MIN } , "max": ${ param.MAX } , "value": ${ param.VAL }  }`;
            
        let message = this.makeAdapterMessage(CMD, set_param)              
        this.sendAdapterMqtt( message );   
        return;     
    }
    

    //Zigbee Network (16 bit) Address 요청 
    async getGet16BitAddr( ZB_ADDR ){

        let CMD = "ADDR";
        let set_param = `{"zb_addr":"${ ZB_ADDR }" }`;

        let message = this.makeAdapterMessage(CMD, set_param)              
        this.sendAdapterMqtt(message);
        return ;
    }


    //태블릿과 시간동기화 
    async setTimeSync( TIME ){

        DEBUG && console.info("컴퓨터 이름:" + os.hostname());     // 
        DEBUG && console.info("OS 이름    :" + os.type());         //  Windows_NT
        DEBUG && console.info("OS 플랫폼  :" + os.platform());     //  win32
        DEBUG && console.info("OS 아키텍처:" + os.arch());         //  x64
        DEBUG && console.info("OS 버전    :" + os.release());      //  10.0.18362
        
        if ( os.platform() == "linux" &&  os.arch() == "arm" ){ // 게이트웨이라면 
            
            let arrDateTime = TIME.split(" ");
            let arrDate = arrDateTime[0].split("-");
            let arrTime = arrDateTime[1].split(":");

            let sDate = new Date();
            sDate.setFullYear( arrDate[0], arrDate[1] - 1, arrDate[2] );
            sDate.setHours(arrTime[0], arrTime[1], arrTime[2] );

            let elapse = parseInt(Math.abs(Date.now() - sDate.getTime()) / 1000, 10);
            console.info("Diff Time :", elapse);
            if( elapse > 1200 ){                
                const { stdout1, stderr1 } = await exec(`date -s "${TIME}"`);
                const { stdout2, stderr2 } = await exec(`hwclock -w`);
                console.info("Change Time OK : ", TIME );

            }else{
                console.info("Change Time Skip : ", TIME );
            }                    
        }
        else{
            throw new Error("시간동기실패 게이트웨이가 아닙니다.");
        }

        return ;
    }


    //현장정보 조회 
    async selSites(){
        let rows = await dbSql.selectSite();
        return rows;
    }

    //현장정보 수정 
    async udtSites(ste_sq, obj ){
        let rtn = await dbSql.updateSite(ste_sq , obj);        
        return rtn;
    }

    //플러그 목록  조회 
    async selDevices( zb_addr ){
        let rows = null;
        if( zb_addr )   //개별조회 
            rows = await dbSql.selectDevice( zb_addr );
        else            //목록조회 
            rows = await dbSql.selectDevices();

        return rows;
    }

    //플러그 삭제
    async delDevice(zb_addr){

        await dbSql.deleteDayReport(zb_addr);   //보고서 삭제
        await dbSql.deleteHourReport(zb_addr);  //보고서 삭제
        await dbSql.deleteSwEvent(zb_addr);     //스위치 변경이력 
        await dbSql.deleteControl(zb_addr);     //제어이력 삭제                
        await dbSql.deleteDevice(zb_addr);      //플러그 삭제 
        
        let CMD = "DEV_DEL";   
        let CMD_PARAM  = zb_addr;
        await dbSql.insertCommand(CMD, CMD_PARAM);        //삭제전송 

        return;
    }

    //플러그정보 수정 
    async udtDevice(zb_addr, obj ){
        let rtn = await dbSql.updateDevice(obj, zb_addr);
        return rtn; 
    }

    //그룹목록 조회 
    async selGroups( grp_sq ){
        let rows = null;
        if( grp_sq )
            rows = await dbSql.selectGroup(  grp_sq );
        else
            rows = await dbSql.selectGroups(  );
        
        return rows;
    }

    //그룹 신규등록  
    async insGroup( obj ){
        let rtn = await dbSql.insertGroup( obj );        
        return rtn;
    }

    //그룹정보 삭제
    async delGroup( grp_sq ){

        await dbSql.updateDeviceGroupNull(grp_sq);      //플러그  그룹정보 NULL

        let schRows = await dbSql.selectScheduleByGroup(grp_sq);
        for ( let schRow of schRows )
        {
            await dbSql.deleteScheduleTimeBySchdSq( schRow.SCHD_SQ );       //시간 스케쥴 정보 삭제 
        }         

        await dbSql.deleteScheduleByGroup(grp_sq);                          //일 스케쥴 삭제
        await dbSql.deleteGroup(grp_sq);    
        
        return ;
    }

    //그룹 정보수정  
    async udtGroup( grp_sq, obj ){
        obj["GRP_SQ"] = grp_sq;        
        let rtn = await dbSql.updateGroup( obj);        
        return rtn;
    }

    //그룹 ON제어 
    async groupOn( grp_sq ){
        let controlObj = {
            ZB_ADDR: null,     //지그비주소(IEEE-64BIT ADDR)
            GRP_SQ : grp_sq,    //그룹일련번호(그룹제어일경우 Not Null)
            CTL_TYPE : 1,       //제어구분(1:수동제어,2:스케줄제어) 
            CTL_OBJ : 2 ,       //제어대상구분(1:개별제어,2:그룹제어, 3:전체제어) 
            CTL_CMD : 1,        //제어명령(0:OFF,1:ON)
            SCHD_TM_SQ:null,    //스케쥴시간 일련번호
            SCHD_SQ:null        //스케쥴일련번호                
        };
        
        await dbSql.insertControl(controlObj);        //제어이력 저장 

        let devRows     = await dbSql.selectDevicesByGroup(grp_sq);     //그룹에 속한 플러그 조회
        let filter      = await this.filterOn(devRows, "group");        //ON제어 필터링

        if(  filter.direct_control.length <= 0 ) //제어 대상 갯수 1개 이상일경우 
            return filter;

        let CMD_PARAM = "";                
        for (let ZB_ADDR of filter.direct_control) {                                      

            if( CMD_PARAM === "" )  CMD_PARAM += `${ZB_ADDR}`;
            else                    CMD_PARAM += `,${ZB_ADDR}`;
        }            
        await dbSql.insertCommand('ON', CMD_PARAM);                 //즉시제어 
        
        return filter;
    }

    
    //그룹 Off제어 
    async groupOff( grp_sq, filter_yn ){

        let controlObj = {
            ZB_ADDR: null,      //지그비주소(IEEE-64BIT ADDR)
            GRP_SQ : grp_sq,    //그룹일련번호(그룹제어일경우 Not Null)
            CTL_TYPE : 1,       //제어구분(1:수동제어,2:스케줄제어) 
            CTL_OBJ : 2 ,       //제어대상구분(1:개별제어,2:그룹제어, 3:전체제어) 
            CTL_CMD : 0,        //제어명령(0:OFF,1:ON)
            SCHD_TM_SQ:null,    //스케쥴시간 일련번호
            SCHD_SQ:null        //스케쥴일련번호                    
        };

        
        await dbSql.insertControl( controlObj );
        
        let devRows = await dbSql.selectDevicesByGroup(grp_sq);
        let filter  = await this.filterOff(devRows, filter_yn, "group");

        if( filter.direct_control.length <= 0 && filter.reserv_control.length <= 0 )        
            return filter

        let CMD_PARAM = "";                
        for (let ZB_ADDR of filter.direct_control) {                                      

            if( CMD_PARAM === "" )  CMD_PARAM += `${ZB_ADDR}`;
            else                    CMD_PARAM += `,${ZB_ADDR}`;
        }

        if(filter.direct_control.length > 0 )                   // 즉시제어 
            await dbSql.insertCommand('OFF', CMD_PARAM);        
            
        for (let aResv of filter.reserv_control) {              // 예약제어               
            await dbSql.insertCommandReserv('OFF', aResv.ZB_ADDR, aResv.RSV_DT, aResv.RSV_TM ); 
        }
        return filter;
    }

     // 개별 ON 제어 
    async plugOn( zb_addr, ctl_type = 1){

        let ctlJSON = {
            ZB_ADDR:zb_addr,        //지그비주소(IEEE-64BIT ADDR)
            GRP_SQ : null,          //그룹일련번호(그룹제어일경우 Not Null)
            CTL_TYPE : ctl_type,    //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)
            CTL_OBJ : 1,            //제어대상구분(1:개별제어,2:그룹제어, 3:전체제어) 
            CTL_CMD : 1,            //제어명령(0:OFF,1:ON)
            SCHD_TM_SQ:null,        //스케쥴시간 일련번호
            SCHD_SQ:null            //스케쥴일련번호                
        };
                
        let devs = await dbSql.selectDevice( ctlJSON.ZB_ADDR );         //플러그 정보 
        let filter = await this.filterOn(devs, "each");                 //개별제어 
        
        if( filter.direct_control.length <= 0 )                         //제어할 대상 찾지 못함. 
            return filter; 
        
        await dbSql.insertControl(ctlJSON);                             //제어명령이력         

        let CMD_PARAM = "";                
        for (let ZB_ADDR of filter.direct_control) {

            if( CMD_PARAM === "" )  CMD_PARAM += `${ZB_ADDR}`;
            else                    CMD_PARAM += `,${ZB_ADDR}`;
        }
            
        await dbSql.insertCommand("ON", CMD_PARAM);        //즉시제어 
        return filter;
    }


    // 개별 OFF 제어 
    async plugOff( zb_addr, filter_yn,  ctl_type = 1){
        
        let ctlJSON = {
            ZB_ADDR:zb_addr,        //지그비주소(IEEE-64BIT ADDR)
            GRP_SQ : null,          //그룹일련번호(그룹제어일경우 Not Null)
            CTL_TYPE : ctl_type,    //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)
            CTL_OBJ : 1 ,           //제어대상구분(1:개별제어,2:그룹제어, 3:전체제어) 
            CTL_CMD : 0,            //제어명령(0:OFF,1:ON)
            SCHD_TM_SQ:null,        //스케쥴시간 일련번호
            SCHD_SQ:null ,          //스케쥴일련번호                
            FILTER_SDKWH : filter_yn  //대기전력 체크 여부 ""
        }; 

        let devs = await dbSql.selectDevice( ctlJSON.ZB_ADDR );

        let ischk_stdkw = ctlJSON["FILTER_SDKWH"] ;   //대기전력 체크 여부("Y"=체크함)
        let filter = await this.filterOff(devs, ischk_stdkw, "each");
            
        if( filter.direct_control.length <= 0 && filter.reserv_control.length <= 0 )                
            return filter; 

        await dbSql.insertControl(ctlJSON);  //제어이력저장

        let CMD_PARAM = "";                
        for (let ZB_ADDR of filter.direct_control) {
            if( CMD_PARAM === "" )  CMD_PARAM += `${ZB_ADDR}`;
            else                    CMD_PARAM += `,${ZB_ADDR}`;
        }
        
        if(filter.direct_control.length > 0 )
            await dbSql.insertCommand('OFF', CMD_PARAM);        //즉시제어 
                
        for (let aResv of filter.reserv_control) {                                      
            await dbSql.insertCommandReserv('OFF', aResv.ZB_ADDR, aResv.RSV_DT, aResv.RSV_TM );     //지연제어 
        }

        return filter;
    }


    //전체 ON 제어 
    async plugAllOn( ctl_type = 1 ){
        
        let ctlJSON = {
            ZB_ADDR:null,       //지그비주소(IEEE-64BIT ADDR)
            GRP_SQ:null,        //그룹일련번호(그룹제어일경우 Not Null)
            CTL_TYPE : ctl_type,       //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)
            CTL_OBJ : 3 ,       //제어대상구분(1:개별제,2:그룹제어, 3:전체제어) 
            CTL_CMD : 1,        //제어명령(0:OFF,1:ON)
            SCHD_TM_SQ:null,    //스케쥴시간 일련번호
            SCHD_SQ:null        //스케쥴일련번호                
        };
                                  
        let onGroupDevs = await dbSql.selectZbOnGroupDev();   //ON Group 

        if( onGroupDevs.length <= 0 ) 
            return onGroupDevs; 
        
        await dbSql.insertControl(ctlJSON);    //명령기록 

        let lists = "[";
        for ( let dev of onGroupDevs )
        {                
            let ZB_ONGRP_RID = dev['ZB_ONGRP_RID'];             
            let ZB_ADDR = dev['ZB_ADDR']; 
            
            if ( lists.length > 1 ) lists += ",";
            lists += `{"gid":"${ZB_ONGRP_RID}","zb_addr":"${ZB_ADDR}"}`;
        }
        lists += "]"

        let ctl_param = `{"cmd_mode":1, "id" : ${lists}, "status":1}`;   
        await dbSql.insertCommand('CTL', ctl_param);        //즉시제어 

        return onGroupDevs;     
    }

    //전체  OFF 제어 
    async plugAllOff( filter_yn, ctl_type = 1 ){
            
        let ctlJSON = {
            ZB_ADDR:null,               //지그비주소(IEEE-64BIT ADDR)
            GRP_SQ:null,                //그룹일련번호(그룹제어일경우 Not Null)
            CTL_TYPE : ctl_type,        //제어구분(1:수동제어,2:스케줄제어, 11:수동제어(클라우드),12:스케줄제어(클라우드)
            CTL_OBJ : 3 ,               //제어대상구분(1:개별제,2:그룹제어, 3:전체제어) 
            CTL_CMD : 0,                //제어명령(0:OFF,1:ON)
            SCHD_TM_SQ:null,            //스케쥴시간 일련번호
            SCHD_SQ:null,               //스케쥴일련번호    
            FILTER_SDKWH : filter_yn    //대기전력 체크 여부 ""            
        };

        let devs = await dbSql.selectDevices();
        let filter = await this.filterOff(devs, ctlJSON.FILTER_SDKWH, "all");
        let offGroupDevs = await dbSql.selectZbOffGroupDevs();   //Off Group 

        if( offGroupDevs.length <= 0 )  return offGroupDevs;

        let effCnt  = await dbSql.insertControl(ctlJSON);        //제어 이력 저장 

        let lists = "[";
        for ( let dev of offGroupDevs )
        {                
            let ZB_OFFGRP_RID = dev['ZB_OFFGRP_RID'];             
            let ZB_ADDR = dev['ZB_ADDR']; 
            
            if ( lists.length > 1 ) lists += ",";
            lists += `{"gid":"${ZB_OFFGRP_RID}","zb_addr":"${ZB_ADDR}"}`;
        }
        lists += "]"

        let ctl_param = `{"cmd_mode":1, "id" : ${lists}, "status":0}`;   
        await dbSql.insertCommand('CTL', ctl_param);        //즉시 제어 

        //지연 OFF제어 플러그 
        for (let aResv of filter.reserv_control) {                                      
            await dbSql.insertCommandReserv('OFF', aResv.ZB_ADDR, aResv.RSV_DT, aResv.RSV_TM ); 
        }

        return offGroupDevs; 
    }


    //일보고서 조회 
    async selDayReport (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectDayReportFromTo(frDate, toDate, offset);
        return rows; 
    }

    //시보고서 조회 
    async selHourReport (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectHourReportFromTo(frDate, toDate, offset);
        return rows; 
    }

    //종합 월 보고서 조회 
    async selMonReportTot (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectMonthReportFromToAtTotal(frDate, toDate, offset);
        return rows; 
    }

    //종합 일 보고서 조회 
    async selDayReportTot (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectDayReportFromToAtTotal(frDate, toDate, offset);
        return rows; 
    }

    //종합 시 보고서 조회 
    async selHourReportTot (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectHourReportFromToAtTotal(frDate, toDate, offset);
        return rows; 
    }

    //휴일 목록 조회 
    async selHolidays( yyyymm )
    {
        let rows = await dbSql.selectHolidays(yyyymm);
        return rows; 
    }

    //휴일 상세 
    async selHoliday(  hoil_dt )
    {
        let rows = await dbSql.selectHoliday(hoil_dt);
        return rows; 
    }

    //휴일 등록 
    async insHoliday(  obj )
    {
        let rtn = await dbSql.insertHoliday(obj);
        return rtn; 
    }

    //휴일 삭제
    async delHoliday(  hoil_dt )
    {
        let rtn = await dbSql.deleteHoliday(hoil_dt);
        return rtn; 
    }

    //휴일 수정 
    async udtHoliday(  hoil_dt, obj )
    {
        let rtn = await dbSql.updateHoliday(obj, hoil_dt);
        return rtn; 
    }

    //플러그 동작이력 
    async selSwEvntReport (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectSwEvent(frDate, toDate);
        return rows; 
    }

    // 제어 이력 
    async selControlReport (  frDate, toDate , offset = 0 )
    {    
        let rows = await dbSql.selectControl(frDate, toDate);
        return rows; 
    }




    //금일 운전될 스케쥴 내역 
    async selScheduleToday()
    {
        let rows = await dbSql.selectAutoDeviceScheduleTime();
        return rows; 
    }

    
    // 스케쥴 설정 내역 
    async selSchedules()
    {
        let rows = await dbSql.selectSchedules();
        return rows; 
    }
    
    // 스케쥴 설정 상세 
    async selSchedule( schd_sq  )
    {
        let rows = await dbSql.selectSchedule( schd_sq );
        return rows; 
    }

    // 스케쥴 등록
    async insSchedule( obj  )
    {
        let rtn = await dbSql.insertSchedule( obj );
        return rtn; 
    }

   // 스케쥴 삭제
   async delSchedule( schd_sq  )
   {                   
       await dbSql.deleteScheduleTimeBySchdSq( schd_sq );   //시간 스케쥴 정보 삭제 
       await dbSql.deleteSchedule( schd_sq );               //스케쥴 정보 삭제 
       return; 
   }

    // 스케쥴 수정
    async udtSchedule( schd_sq, obj  )
    {
        let rtn = await dbSql.updateSchedule( obj, schd_sq );
        return rtn; 
    }


    
    // 시간스케쥴  설정 내역 
    async selScheduleTimes()
    {
        let rows = await dbSql.selectScheduleTimes();
        return rows; 
    }

    // 시간스케쥴  상세 
    async selScheduleTime( schd_tm_sq )
    {
        let rows = await dbSql.selectScheduleTime( schd_tm_sq );
        return rows; 
    }

    // 시간스케쥴 정보  등록
    async insScheduleTime( obj  )
    {
        let rtn = await dbSql.insertScheduleTime( obj );
        return rtn; 
    }

    // 시간스케쥴 정보 삭제
    async delScheduleTime( schd_tm_sq  )
    {
        let rtn = await dbSql.deleteScheduleTime( schd_tm_sq );   //시간 스케쥴 정보 삭제         

        return rtn; 
    }

    // 시간스케쥴 정보 수정
    async udtScheduleTime( schd_tm_sq, obj  )
    {
        let rtn = await dbSql.updateScheduleTime( obj, schd_tm_sq );
        return rtn; 
    }    



    
    //수동 OFF시 제어 대상 기기  검색  ( Off 제어시 필터링 )    
    async filterOff( devRows , ischk_stdkw, ctl_kind="all" )  {
        
        let rtnResult =  {
            maun_ctl_allow_filter : [],
            use_kw_filter : [],    
            direct_control : [],            
            reserv_control : [],           
        };
        
        if( typeof devRows !== 'object' && devRows.length <= 0 ) 
            return rtnResult;

        for (let row of devRows) {

            if( ctl_kind == "all" && row.MANU_CTL_ALLOW !== 1 )              //전체제어  허용여부 체크 
            {
                DEBUG && console.info( `${row.ZB_ADDR} can not off because manual control not allow` );
                rtnResult.maun_ctl_allow_filter.push(row.ZB_ADDR);
                continue;
            }


            if( ischk_stdkw === 'y' ||  ischk_stdkw === '' )     //기준 대기전력 체크 
            {
                if( typeof row.STBY_KW === "number" && typeof row.KW === "number" && row.STBY_KW > 0 && row.KW > 0 )    //현재 순시전력이 뜨고 대기전력 기준이 있다면 비교
                {
                    if( row.KW > row.STBY_KW )
                    {
                        DEBUG && console.info( `${row.ZB_ADDR} can not off because using KW(${row.KW}) > STBY_KW(${row.STBY_KW})` );
                        rtnResult.use_kw_filter.push(row.ZB_ADDR);
                        continue;
                    }                        
                }
            }

            if( typeof row.OFF_DELY === "number" && row.OFF_DELY > 0  )  {  //OFF 지연시간 

                let  cData = new Date();
                cData.setSeconds(cData.getSeconds() + row.OFF_DELY );

                let rsv_dt = xpUtils.getYYYYMMDD(cData);
                let rsv_tm = xpUtils.getHH24MISS(cData);

                rtnResult.reserv_control.push({ 
                    ZB_ADDR : row.ZB_ADDR, 
                    RSV_DT : rsv_dt, 
                    RSV_TM : rsv_tm
                    });
                
            } else {
                rtnResult.direct_control.push(row.ZB_ADDR);                
            }            
        }
        return rtnResult;
    }

    //수동 ON시 제어 대상기기  검색   ( On 제어시 필터링 )    
    async filterOn( devRows, ctl_kind="all" )        
    {
        let rtnResult =  {
            maun_ctl_allow_filter : [],
            direct_control : []
        };
        
        if( typeof devRows !== 'object' && devRows.length <= 0 ) 
            return rtnResult;

        for (let row of devRows) {
            
            if( ctl_kind == "all" && row.MANU_CTL_ALLOW !== 1 )              //전체제어  허용여부 체크 
            {
                console.info( `${row.ZB_ADDR} can not on because manual control not allow` );
                rtnResult.maun_ctl_allow_filter.push(row.ZB_ADDR);
                continue;
            }
                  
            rtnResult.direct_control.push(row.ZB_ADDR);           
        }
        return rtnResult;
    }



    /////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////   ADMIN     ////////////////////////////////
    ////////////////////////////////   ADMIN     ////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    
    //지그비 그룹 초기화 
    async zbGroupReset(){
        let CMD = "GROUP";   
        let CMD_PARAM  = `{"cmd_mode":3, "zb_addr":"", "grp_id":""}`; //명령종류[0:등록,1:단일그룹삭제, 2:조회(확인), 3:전체그룹삭제]
        
        await dbSql.insertCommand(CMD, CMD_PARAM);        //지그비 초기화 명령 전송
        await dbSql.insertCommand(CMD, CMD_PARAM);        //지그비 초기화 명령 전송

        await dbSql.updateZbGroupResetAll();              //지그비 그룹정보 초기화 
    }

    //지그비 그룹 조회
    async selZbGroups(){
        let rows = await dbSql.selectZbGroupingStat();              //지그비 그룹정보 초기화 
        return rows;
    }


    //디바이스명 초기화 
    async initDevName( ignore_pre_set = 'y' ){

        let devRows = await dbSql.selectDevicesOrderByAddr();
        let idx = 0;
        for ( let devRow of devRows )
        {
            idx++;
            let devName =  this.lpadZero(idx, 3);                    
            
            if( ignore_pre_set == 'y' ) // 이전 설정 무시라면 ==> 그냥 업데이트
            {                        
                await dbSql.updateDevice( {DEV_NM : devName }, devRow["ZB_ADDR"] );       
            }
            else                           
            {
                //이전설정 무시가 아니라면 ==> 지그비주소와 이름이 같은 경우만 변경 
                if(  devRow["ZB_ADDR"] == devRow["DEV_NM"] )                        
                    await dbSql.updateDevice( {DEV_NM : devName }, devRow["ZB_ADDR"] );                            
            }
        }
        return idx;      
    }




    //네트워크  설정 파일 읽기 
    async readNetFile(){

        if ( os.platform() != "linux" ||  os.arch() != "arm" ) {
            throw new Error("읽기실패 게이트웨이가 아닙니다.");
        }

        let ifFilePath = "/etc/network/interfaces"
        let ifstr = fs.readFileSync(ifFilePath, 'utf8');
        return ifstr; 
    }


    //Network  설정 파일 쓰기 (파일내용 통채로 쓰기)
    async writeNetFile( body ){

        if ( os.platform() != "linux" ||  os.arch() != "arm" )
            throw new Error("읽기 실패 게이트웨이가 아닙니다.");            

        let ifFilePath = "/etc/network/interfaces"
        let ifstr = body["file"];
        
        fs.writeFileSync(ifFilePath, ifstr, 'utf8');
        return;
    }



    //네트워크  설정 파일 읽기 
    async readNetFileFormat(){

        if ( os.platform() != "linux" ||  os.arch() != "arm" ) {
            throw new Error("읽기실패 게이트웨이가 아닙니다.");
        }

        let ifFilePath = "/etc/network/interfaces"
        let ifstr = fs.readFileSync(ifFilePath, 'utf8');
        let arrLine = ifstr.split("\n");

        let rtn = {        
            e_yn  : '0', e_addr : '', e_mask : '', e_gate : '', 
            w_yn  : '0', w_addr : '', w_mask : '', w_gate : ''
        };

       
        
        let curInterface = "";
        if( Array.isArray( arrLine ) )
        {
            arrLine.forEach((data)=>{

                if( data.startsWith("auto") ||  data.startsWith("allow-hotplug") )
                {
                    curInterface  = data
                    return true;
                }

                if( curInterface.trim() == "auto eth0"){
                    rtn.e_yn = "1";

                    if( data.startsWith("address"))
                        rtn.e_addr = data.substr( data.indexOf(" ") + 1 );
                    
                    if( data.startsWith("netmask"))
                        rtn.e_mask = data.substr( data.indexOf(" ")  + 1 );

                    if( data.startsWith("gateway"))
                        rtn.e_gate = data.substr( data.indexOf(" ") + 1 );                    
                }

                if( curInterface.trim() == "allow-hotplug wlan0"){
                    rtn.e_yn = "0";
                    rtn.e_addr = "";
                    rtn.e_mask = "";
                    rtn.e_gate = "";

                    rtn.w_yn = "1";
                    if( data.startsWith("address") )
                        rtn.w_addr = data.substr( data.indexOf(" ") + 1);
                    
                    if( data.startsWith("netmask") )
                        rtn.w_mask = data.substr( data.indexOf(" ") + 1 );

                    if( data.startsWith("gateway") )
                        rtn.w_gate = data.substr( data.indexOf(" ") + 1 );
                   
                }
                
            });
        }
        
        
        return rtn; 
    }
    
    
    //Network  설정 파일 쓰기 
    async writeNetFileFormat( body ){

        if ( os.platform() != "linux" ||  os.arch() != "arm" )
            throw new Error("쓰기 실패 게이트웨이가 아닙니다.");            

        let ifFilePath = "/etc/network/interfaces"

        let e_yn    = body["e_yn"]   || '';
        let e_addr  = body["e_addr"] || '';
        let e_mask  = body["e_mask"] || '';
        let e_gate  = body["e_gate"] || '';

        let w_yn   = body["w_yn"]    || '';
        let w_addr = body["w_addr"]  || '';
        let w_mask = body["w_mask"]  || '';
        let w_gate = body["w_gate"]  || '';


        let ifstr = "";        
        ifstr += `auto lo\n`;
        ifstr += `iface lo inet loopback\n\n`;

        //유선설정 
        if( e_yn == "1") {
            ifstr += `auto eth0\n`;
            ifstr += `iface eth0 inet static\n`;
            ifstr += `address ${e_addr}\n`;
            ifstr += `netmask ${e_mask}\n`;
            ifstr += `gateway ${e_gate}\n\n\n`;

            //AS용 고정으로 사용 
            ifstr += `auto eth0:0\n`;
            ifstr += `iface eth0:0 inet static\n`;
            ifstr += `address 192.168.202.202\n`;
            ifstr += `netmask 255.255.255.0\n`;
        } else if  ( w_yn == "1") {     //무선설정 
            //AS용 고정으로 사용 
            ifstr += `auto eth0\n`;
            ifstr += `iface eth0 inet static\n`;
            ifstr += `address 192.168.202.202\n`;
            ifstr += `netmask 255.255.255.0\n\n\n`;
            
            ifstr += `allow-hotplug wlan0\n`;
            ifstr += `iface wlan0 inet static\n`;
            ifstr += `wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf\n`;
            ifstr += `address ${w_addr}\n`;
            ifstr += `netmask ${w_mask}\n`;            
            ifstr += `gateway ${w_gate}\n\n`;            
        }
        
        console.log( ifstr );
        fs.writeFileSync(ifFilePath, ifstr, 'utf8');
        return;
    }

    
    
    //Wifi 설정 파일 읽기 
    async readWifiFile(){

        if ( os.platform() != "linux" ||  os.arch() != "arm" ){
            throw new Error("읽기 실패 게이트웨이가 아닙니다.");
        }

        let ifFilePath = "/etc/wpa_supplicant/wpa_supplicant.conf";            
        let ifstr = fs.readFileSync(ifFilePath, 'utf8');
        console.log( ifstr );
        return ifstr; 
    }

    //Network  설정 파일 통채로 쓰기 
    async writeWifiFile( body ){
        
        if ( os.platform() != "linux" ||  os.arch() != "arm" )
            throw new Error("쓰기 실패 게이트웨이가 아닙니다.");

        let ifstr = body["file"];
        let ifFilePath = "/etc/wpa_supplicant/wpa_supplicant.conf";

        fs.writeFileSync(ifFilePath, ifstr, 'utf8');
    }


    //Wifi 설정 파일 읽기 
    async readWifiFileFormat(){

        if ( os.platform() != "linux" ||  os.arch() != "arm" ){
            throw new Error("읽기 실패 게이트웨이가 아닙니다.");
        }

        let ifFilePath = "/etc/wpa_supplicant/wpa_supplicant.conf";        
        let ifstr = fs.readFileSync(ifFilePath, 'utf8');

        let arrLine = ifstr.split("\n");
        
        let rtn = { ssid : "", psk : "" , key_mgmt : "" };

        if( Array.isArray( arrLine ) )
        {
            arrLine.forEach((data)=>{

                if( data.trim().startsWith("ssid") )
                {
                    rtn.ssid = data.substring( data.indexOf("\"")+1, data.lastIndexOf("\"") );
                }

                if( data.trim().startsWith("psk") )
                {
                    rtn.psk = data.substring( data.indexOf("\"")+1, data.lastIndexOf("\"") );
                }

                if( data.trim().startsWith("key_mgmt") )
                {
                    rtn.key_mgmt = data.substr( data.indexOf("=") + 1);
                }
            });
        }
                
        console.log( rtn );
        
        return rtn; 
    }


    //Network  설정 파일  쓰기 
    async writeWifiFileFormat( body ){
        
        if ( os.platform() != "linux" ||  os.arch() != "arm" )
            throw new Error("쓰기 실패 게이트웨이가 아닙니다.");            


        let ifFilePath = "/etc/wpa_supplicant/wpa_supplicant.conf";

        let ssid        = body["ssid"]   || '';
        let psk         = body["psk"] || '';
        let key_mgmt    = body["key_mgmt"] || '';
        
        let ifstr = '';
        ifstr += `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n`;
        ifstr += `update_config=1\n\n`;

        ifstr += `network={\n`;
        ifstr += `        ssid="${ssid}"\n`;
        ifstr += `        psk="${psk}"\n`;
        ifstr += `        key_mgmt=${key_mgmt}\n`;
        ifstr += `}\n`;

        fs.writeFileSync(ifFilePath, ifstr, 'utf8');        
    }


    //네트워크 재시작 
    async restartNetwork(){

        if ( os.platform() == "linux" &&  os.arch() == "arm" ){ // 게이트웨이라면
            const { stdout1, stderr1 } = await exec(`systemctl restart networking`);
            console.info("networking restart OK : ");
        }
        else{
            throw new Error("네트워크 재시작 실패  게이트웨이가 아닙니다.");
        }        
    }

    //리부팅 
    async reboot(){

        if ( os.platform() == "linux" &&  os.arch() == "arm" ){ // 게이트웨이라면
            const { stdout1, stderr1 } = await exec(`reboot`);
            console.info(" reboot OK : ");
        }
        else{
            throw new Error("리부팅 실패  게이트웨이가 아닙니다.");
        }        
    }


    /////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////   COMMON    ////////////////////////////////
    ////////////////////////////////   COMMON    ////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    //아답터로 메세지 보내기
    sendAdapterMqtt( message ){    
        this.mqttAdapter.sendMessage(`${message}`);    
    }

    //아답터로 보낼 메세지 만들기 
    makeAdapterMessage( cmd, cmd_param )
    {
        let obj = {
            "pkn"  : 1,	            //M=패킷구분  			[0:통보(응답불필요),1:요청(응답요구),2:요청(응답불필요),3:응답 ]	                    
            "cmd"  : cmd,	        //M=명령종류  				
            "tno"  : 0, 	        //M=트랜잭션번호 		
            "data" : JSON.parse(cmd_param) 
        };

        return  JSON.stringify(obj);
    }


    lpadZero(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
}


module.exports = function(){
    
    return new WebService();
}