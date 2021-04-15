
'use strict';
const   C_AREA              = require('../common_area');

const   dbSql               = C_AREA.dbSql;
var     mqttCloud           = C_AREA.mqttCloud;
// const mqttAdapter           = C_AREA.mqttAdapter
// const webService            = C_AREA.webService;

const DEBUG = false; 
let _this;

class DbSyncThread 
{
    constructor() 
    {
        _this  = this;
        
        //계측데이터 및 설정 데이터 동기화 
        dbSql.on( 'ondatachange', (chngData) => {
            this.onChangeDbData(chngData);
        });
     
        this.reportSync();  //보고서 동기화 
    }


    
    //데이터베이스 계측 및 설정데이터 
    /**
     * 계측 및 설정 DB를 동기화 합니다. (TB_SITE, TB_DEV, TB_GROUP, TB_HOLIDAY, TB_SCHD, TB_SCHD_TM)
     */

    async onChangeDbData( dbChageData )
    {        

        if( mqttCloud.isUseCloud() == false ){            
            console.info(`[DbSyncThread:onChangeDbData()] cloud is not use!`);    
            return;
        }

        console.info(`[DbSyncThread] onChangeDbData from dbSql : '${JSON.stringify(dbChageData)}'` );

        const APLY_TABLE = ["TB_SITE", "TB_DEV", "TB_GROUP", "TB_SCHD", "TB_SCHD_TM" , "TB_HOLIDAY"];
        const APLY_OP    = ["INSERT", "DELETE", "UPDATE", "TABLE_SYNC"];

        if( !APLY_TABLE.includes( dbChageData.TABLE) )
        {
            console.error(`[DbSyncThread] : unknown table ${dbChageData.TABLE}`);
            return;
        }


        if( !APLY_OP.includes( dbChageData.OP) )
        {
            console.error(`[DbSyncThread] : unknown operation ${dbChageData.OP}`);
            return;
        }        

        let syncType = "";
        let selSql = `SELECT * FROM ${dbChageData.TABLE}`;

        if( dbChageData.KEYS == null ) 
        {            
            //sync by table
            syncType = "TABLE";
        }
        else  
        {
            //sync by row 
            let wheres = dbChageData.KEYS
            let whereColums = '';
            for (let colName of Object.keys(wheres))
            {
                if( whereColums === '' )
                    whereColums += `  ${colName}='${wheres[colName]}'`;
                else
                    whereColums += `AND ${colName}='${wheres[colName]}'`;
            }

            selSql = `${selSql} WHERE ${whereColums}`;

            syncType = "ROW";
        }
        
        console.info(`[DbSyncThread] : Sync Type = '${syncType}', Table = '${dbChageData.TABLE}' `);
        console.info(`[DbSyncThread] : SQL = '${selSql}' `);

        let rows = null;
        if(dbChageData.OP && dbChageData.OP == "DELETE" ){
            
            if ( dbChageData.KEYS  ) {
                rows = new Array();                        
                rows.push( dbChageData.KEYS );
            }
            
        }else {
            rows =  await dbSql.doSelect( `${selSql}`);
        }

        this.sendToCloud("DB_SYNC_MEAS",  dbChageData.TABLE, dbChageData.OP,  syncType,  rows);
    }


    //데이터 
    sendToCloud( cmd, table, op, sync_type, data )
    {
        let colud_msg = {
            hd : {
                src         : "GATEWAY", 
                cmd         : cmd,
                table       : table,
                op          : op,
                sync_type   : sync_type,
            },
            bd : data
        };

        return mqttCloud.sendMessage(  JSON.stringify( colud_msg ) );
    }



    
    
    /**
     * 보고서 DB를 동기화 합니다. (TR_DAY, TR_HOUR, TR_SW_EVENT, TR_CTRL)
     */
    async reportSync(){

        console.info( "[DbSyncThread] report Data Sync...");

        if( mqttCloud.isUseCloud() == false ){

            console.info(`[DbSyncThread:reportSync()] cloud is not use!`);    

            setTimeout( ()=> { this.reportSync();  }, 30000);  //30초에 한번씩 체크 

            return;
        }


        //Send Day Report (TR_DAY)
        try{ 
            let dayRs =  await dbSql.selectDayReportForColud();
            for ( let row of dayRs )
            { 
                let stat = this.sendToCloud("DB_SYNC_REPORT",  "TR_DAY", "",  "INSERT",  row);

                if( stat )
                    await dbSql.updateDayReportSndSt( row );            
            }        
            
        }catch( reason )
        {
            console.error("[reportSync] Day Report " + reason.message); 
        } 

        
        //Send Hour Report (TR_HOUR)
        try{ 
            let hourRs =  await dbSql.selectHourReportForColud();
            for ( let row of hourRs )
            { 
                let stat = this.sendToCloud("DB_SYNC_REPORT",  "TR_HOUR", "",  "INSERT",  row);

                if( stat )
                    await dbSql.updateHourReportSndSt( row );            
            }        
            
        }catch( reason )
        {
            console.error("[reportSync] Hour Report " + reason.message); 
        } 
        

        //Send Switch Event  (TR_SW_EVNT)
        try{ 
            let swEventRs =  await dbSql.selectSwEventForCloud();
            for ( let row of swEventRs )
            { 
                let stat = this.sendToCloud("DB_SYNC_REPORT",  "TR_SW_EVNT", "",  "INSERT",  row);

                if( stat )
                    await dbSql.updateSwEventSndSt( row );            
            }        
            
        }catch( reason )
        {
            console.error("[reportSync] SW Event " + reason.message); 
        } 
        

        //Send Control  (TR_CTRL)
        try{ 
            let ctrlRs =  await dbSql.selectControltForCloud();
            for ( let row of ctrlRs )
            { 
                let stat = this.sendToCloud("DB_SYNC_REPORT",  "TR_CTRL", "",  "INSERT",  row);

                if( stat )
                    await dbSql.updateControlSndSt( row );            
            }        
            
        }catch( reason )
        {
            console.error("[reportSync] Control " + reason.message); 
        } 

        setTimeout( ()=> { this.reportSync();  }, 30000);  //30초에 한번씩 체크 
    }   

}

module.exports = new DbSyncThread();
