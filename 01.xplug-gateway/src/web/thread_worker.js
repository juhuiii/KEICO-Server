const   C_AREA              = require('../common_area');
const   xpUtils             = require("../utils/xg_datetime");

const   dbSql               = C_AREA.dbSql;
const   DEBUG = true; 
let     _this;

class WorkerThread
{
    constructor() 
    {                        
        console.info( "[WorkerThread] Worker Thread Startup OK .");
        
        _this  = this;
        
        _this.lastReportHour = 0;   //시간보고서 체크용 
        _this.lastClearHour  = 0;   //시간보고서 체크용 
        _this.reportNoUpdateCountHour = 0;

        _this.lastReportDay = 0;
        _this.lastClearDay  = 0;
        _this.reportNoUpdateCount = 0;

        dbSql.open();    
        
        setInterval(() => {
            //console.info("bl thead running!");
            
            this.scheduleControl();     //스케쥴 제어 
            this.checkComError();       //통신이상 처리 
            this.toHourReport();        //시간 보고서생성 
            this.todayReport();         //일 보고서생성 
            this.clearData();           //과거자료 삭제 

        }, 1000);
    }


    async scheduleControl()
    {
        dbSql.selectTodayIsHoliday().then((rows) => {   //금일 휴일여부조회 
            let isTodayHoliday = false;
         
            if( rows && rows.length > 0) isTodayHoliday = true;

            rows = null;
            
            return dbSql.selectDoRunScheduleTime(isTodayHoliday);   //스케쥴조회

        }).then((scheduleRows) => {

            if( !scheduleRows && scheduleRows.length <= 0)            
                return;
            
            for (let theSchedule of scheduleRows)
            {
                console.info(`Run Schedule: SCHD_SQ=${theSchedule.SCHD_SQ}, GRP_SQ=${theSchedule.GRP_SQ}, WEEK_BIT=${theSchedule.WEEK_BIT}, HOLI_YN=${theSchedule.HOLI_YN}, SCHD_TM_SQ=${theSchedule.SCHD_TM_SQ}, CTL_TIME=${theSchedule.CTL_TIME}, CTL_CMD=${theSchedule.CTL_CMD}`);

                let TR_CTRL = 
                {
                    GRP_SQ   : theSchedule.GRP_SQ,
                    CTL_TYPE : 2,               //제어구분(1:수동제어,2:스케줄제어)
                    CTL_OBJ  : 2,                //제어대상구분(1:개별제,2:그룹제어)
                    CTL_CMD  : theSchedule.CTL_CMD,      //제어명령(0:OFF,1:ON)                                        
                    SCHD_TM_SQ : theSchedule.SCHD_TM_SQ //스케쥴 일련번호 
                };

                dbSql.insertControl(TR_CTRL).then((result) => {  //제어이력 저장 

                    dbSql.selectDevicesByGroup(theSchedule.GRP_SQ).then((devRows) => {   //그룹에 속한 플러그 목록
                                             
                        if( devRows && devRows.length <= 0) 
                        {
                            console.info(`ON/OFF Command Sending by Schedule : device count is 0 in group(${theSchedule.GRP_SQ})`);
                            return;                            
                        }

                        let CMD = (theSchedule.CTL_CMD == 1 ) ? 'ON' : 'OFF';

                        let result = {};
                        if( theSchedule.CTL_CMD == 1 )      //ON제어 
                            result = this.filterOnControlDev(devRows);
                        else if ( theSchedule.CTL_CMD == 0 )//OFF제어 
                            result = this.filterOffControlDev(devRows);


                        
                        let CMD_PARAM = "";                
                        for (let ZB_ADDR of result.direct_control) {                                      

                            if( CMD_PARAM === "" )  CMD_PARAM += `${ZB_ADDR}`;
                            else                    CMD_PARAM += `,${ZB_ADDR}`;
                        }
                        if(result.direct_control.length > 0 )
                        {                            
                            dbSql.insertCommand(CMD, CMD_PARAM).then((result) => {
                                console.info(`Direct ON/OFF Command by Schedule :  ${CMD} = ${CMD_PARAM} `);
                            }).catch(function (reason) {
                                console.error(reason.message);    
                            });

                        }

                
                        if( theSchedule.CTL_CMD == 0 &&  result.reserv_control.length > 0 )       //OFF는 지연도 있음 
                        {
                            for (let aResv of result.reserv_control) {
                                dbSql.insertCommandReserv(CMD, aResv.ZB_ADDR, aResv.RSV_DT, aResv.RSV_TM).then((result) => {
                                    console.info(`ON/OFF Reserve Control Command by Schedule :  ${CMD} = ${aResv.ZB_ADDR}, ${aResv.RSV_DT} , ${aResv.RSV_TM}`);
                                }).catch(function (reason) {
                                    console.error(reason.message);    
                                });
                            }
                        }
                    }).catch(function (reason) {
                        console.error(reason.message);
                    });

                    return dbSql.updateDoRunScheduleTimeComplete(theSchedule.SCHD_TM_SQ, theSchedule.TO_DATE );

                }).then((result) => {
                   
                    console.info(`Run Complete Schedule : SCHD_SQ=${theSchedule.SCHD_SQ}, GRP_SQ=${theSchedule.GRP_SQ}, WEEK_BIT=${theSchedule.WEEK_BIT}, HOLI_YN=${theSchedule.HOLI_YN}, SCHD_TM_SQ=${theSchedule.SCHD_TM_SQ}, CTL_TIME=${theSchedule.CTL_TIME}, CTL_CMD=${theSchedule.CTL_CMD}`);
                    
                }).catch(function (reason) {
                    console.error(reason.message);
                });
            } //End of theSchedule 

            scheduleRows = null;
        }).catch(function (reason) {
            console.error(reason.message);
        });

    }

    //통신이상 처리 
    checkComError(){
        dbSql.updateDeviceComError().then((result) => {
            if (result.changes > 0)
                console.info("New occurs com error : ", result.changes);

        } ).catch(function (reason) {
            console.error(reason.message);
        });
    }

    //지그비 명령 전송 실패처리
    zbCommandSendError(){       
    }


    //시 보고서 작성 
    async toHourReport()
    {
        if( _this.lastReportHour == 0 ){ // 최초한번                     
            await _this.toHourReportCreate();
            _this.lastReportHour  = xpUtils.getCurYYYYMMDDHH();
            await _this.toHourReportUpdate();    //이전 날짜 최종 업데이트 
        }
        else if (_this.lastReportHour != xpUtils.getCurYYYYMMDDHH() ) {   //날짜가 넘어가거나, 새로 추가된 장비가 있는경우         
            await _this.toHourReportUpdate();    //이전 날짜 최종 업데이트             
            _this.lastReportHour  = xpUtils.getCurYYYYMMDDHH();
            await _this.toHourReportCreate();    //신규 날짜 생성 
        }
        else {                                                   //일상적인 업데이트        
            
            _this.reportNoUpdateCountHour++;
            //if(  _this.reportNoUpdateCountHour > 120 )   //2분에 한번만 갱신
            if(  _this.reportNoUpdateCountHour > 20 )   //2분에 한번만 갱신
                _this.toHourReportUpdate();
        }
    }
    //시보고서 업데이트 
    async toHourReportUpdate()
    {        
        await dbSql.selectDevices().then((deviceRows) => {                        
            for ( let devRow of deviceRows )
            {
                let hourR = { 
                    ZB_ADDR : devRow.ZB_ADDR, 
                    TX_DT   : parseInt(_this.lastReportHour / 100),
                    TX_TM   : parseInt(_this.lastReportHour % 100), 
                    E_AKWH  : devRow.AKWH 
                };                   

                dbSql.updateHourReport(hourR).then((result) => {
                    if (result.changes > 0){                    
                        //DEBUG && console.info("Update HOUR Report success for ", devRow.ZB_ADDR, _this.lastReportHour );                        
                    }
                    else
                    {                        
                        console.info("Update HOUR Report [Effect Row Count 0] for ", devRow.ZB_ADDR, _this.lastReportHour );
                        _this.lastReportHour  = 0;   //업데이트 되지 않은 보고서가 있다면 최종생성일 초기화하여 다시 생성하도록 한다.
                    }                
                }).catch(function (reason) {
                    console.error(reason.message);
                });
            }
            deviceRows = null;
        }).catch(function (reason) {
            console.error(reason.message);
        });    

        _this.reportNoUpdateCountHour = 0;
    }    
    //시보고서 생성 
    async toHourReportCreate()
    {
        await dbSql.insertToHourReport().then((result) => {            
            DEBUG && console.info("[WorkerThread] Create HOUR Report : ", result.changes);    
        } ).catch(function (reason) {
            console.error(reason.message);
        });
    }





    //일보고서 작성 
    async todayReport() {        
        // 금일 보고서 생성 처리 
        if( _this.lastReportDay == 0 ){                             // 최초한번                     
            await _this.todayReportCreate();
            _this.lastReportDay  = xpUtils.getCurDate();
            await _this.todayReportUpdate();                        //이전 날짜 최종 업데이트 
        }
        else if (_this.lastReportDay != xpUtils.getCurDate()) {     //날짜가 넘어가거나, 새로 추가된 장비가 있는경우         
            await _this.todayReportUpdate();                        //이전 날짜 최종 업데이트             
            _this.lastReportDay  = xpUtils.getCurDate();
            await _this.todayReportCreate();                        //신규 날짜 생성 
        }
        else {                                                      //일상적인 업데이트        
             
            _this.reportNoUpdateCount++;
            if(  _this.reportNoUpdateCount > 120 )   //2분에 한번만 갱신
                _this.todayReportUpdate();
        } 
    }     
    async todayReportUpdate()
    {        
        await dbSql.selectDevices().then((deviceRows) => {                        
            for ( let devRow of deviceRows )
            {
                let dayR = {                     
                    ZB_ADDR : devRow.ZB_ADDR, 
                    TX_DT   : _this.lastReportDay,
                    E_AKWH  : devRow.AKWH 
                };                                
                dbSql.updateDayReport(dayR).then((result) => {
                    if (result.changes > 0){                    
                        //DEBUG && console.info("Update Day Report success for ", devRow.ZB_ADDR, _this.lastReportDay );                        
                    }
                    else{                        
                        DEBUG && console.info("Update Day Report [Effect Row Count 0] for ", devRow.ZB_ADDR, _this.lastReportDay );
                        _this.lastReportDay  = 0;   //업데이트 되지 않은 보고서가 있다면 최종생성일 초기화하여 다시 생성하도록 한다.
                    }                
                }).catch(function (reason) {
                    console.error(reason.message);
                });
            }

            deviceRows = null;
        }).catch(function (reason) {
            console.error(reason.message);
        });    
        _this.reportNoUpdateCount = 0;
    }

    async todayReportCreate()
    {
        await dbSql.insertTodayReport().then((result) => {            
            DEBUG && console.info("[WorkerThread] Create Day Report : ", result.changes);    
        } ).catch(function (reason) {
            console.error(reason.message);
        });
    }

    //데이터 정리 
    clearData(){        
        if( _this.lastClearDay == xpUtils.getCurDate() ) return;        //1일 한번만 

        dbSql.clearOldHoliyday().then((result) => {     
            DEBUG && console.info("[WorkerThread] clearOldHoliyday:", result.changes );                    
            return dbSql.clearOldZbCommand();
        }).then((result) => {
            DEBUG && console.info("[WorkerThread] clearOldZbCommand:", result.changes );
            return dbSql.clearOldSyslog();            
        }).then((result) => {
            DEBUG && console.info("[WorkerThread] clearOldSyslog:", result.changes );
            return dbSql.clearOldSwEvent();
        }).then((result) => {
            DEBUG && console.info("[WorkerThread] clearOldSwEvent:", result.changes );
            return dbSql.clearOldControl();
        }).then((result) => {
            DEBUG && console.info("[WorkerThread] clearOldControl:", result.changes );
            return dbSql.clearOldDayReport();
        }).then((result) => {
            DEBUG && console.info("[WorkerThread] clearOldDayReport:", result.changes );         
            return dbSql.clearOldHourReport();
        }).then((result) => {
            DEBUG && console.info("[WorkerThread] clearOldHourReport:", result.changes ); 
        }).catch(function (reason) {
            console.error(reason.message);
        });

        _this.lastClearDay = xpUtils.getCurDate();
    }



    filterOffControlDev( devRows )       //자동 OFF시 제어 대상 기기  검색 
    {
        let rtnResult =  {
            maun_ctl_allow_filter : [],
            use_kw_filter : [],    
            direct_control : [],            
            reserv_control : [],           
        };
        
        if( typeof devRows !== 'object' && devRows.length <= 0 ) 
            return rtnResult;

        for (let row of devRows) {
            
            if( typeof row.STBY_KW === "number" && typeof row.KW === "number" && row.STBY_KW > 0 && row.KW > 0 )    //현재 순시전력이 뜨고 대기전력 기준이 있다면 비교
            {
                if( row.KW > row.STBY_KW )
                {
                    DEBUG && console.info( `${row.ZB_ADDR} Can not off because using KW(${row.KW}) > STBY_KW(${row.STBY_KW})` );
                    rtnResult.use_kw_filter.push(row.ZB_ADDR);
                    continue;
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

    filterOnControlDev( devRows )        //자동 ON시 제어 대상 기기  검색 
    {
        let rtnResult =  {
            maun_ctl_allow_filter : [],
            direct_control : []
        };
        
        if( typeof devRows !== 'object' && devRows.length <= 0 ) 
            return rtnResult;

        for (let row of devRows) {           
            rtnResult.direct_control.push(row.ZB_ADDR);           
        }
        return rtnResult;
    }
}

module.exports = new WorkerThread();