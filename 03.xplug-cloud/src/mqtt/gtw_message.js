'use strict';

const   C_AREA          = require('../common_area');
var     db              = C_AREA.database;

// 아답터에서 받은 메세지 처리 로직
class GatewayMessage {

    constructor() {}

    async proc( ste_id, gtw_id, jsonMsg )
    {
        try{
            switch( jsonMsg.hd.cmd )
            {
                case 'DB_SYNC_MEAS'        :                               //설정 또는 계측 DB  (TB_SITE, TB_DEV, TB_GROUP, TB_HOLIDAY, TB_SCHD, TB_SCHD_TM)
                    await this.procMeas( ste_id, gtw_id, jsonMsg );
                    break;
                case 'DB_SYNC_REPORT'      :                               //보고서 DB (TR_DAY, TR_HOUR, TR_SW_EVENT, TR_CTRL)
                    await this.procReport(ste_id, gtw_id, jsonMsg );
                    break;
                default :
                    console.error( `GATEWAY unknown command='${jsonMsg.bd.cmd}'` );
            }
        }catch( reason )
        {
            console.error(reason.message);
        }

    }



    //ON / OFF 상태 변경
    async procMeas(ste_id, gtw_id, jsonMsg) {

        try {
            let table       = jsonMsg.hd.table    ;   //테이블명
            let op          = jsonMsg.hd.op       ;   //OPERATION : INSERT, UPDATE, DELETE
            let sync_type   = jsonMsg.hd.sync_type;   //SYNC TYPE : TABLE, ROW

            if( sync_type == "TABLE" )
            {
                switch ( table ){           //(TB_SITE, TB_DEV, TB_GROUP, TB_HOLIDAY, TB_SCHD, TB_SCHD_TM)
                    case "TB_SITE" :
                        this.procTbSiteTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    case "TB_DEV" :
                        this.procTbDevTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    case "TB_GROUP" :
                        this.procTbGroupTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    case "TB_HOLIDAY" :
                        this.procTbHolidayTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    case "TB_SCHD" :
                        this.procTbSchdTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    case "TB_SCHD_TM" :
                        this.procTbSchdTmTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    default :
                        console.error("unknown gateway table name : " + table);
                }
            }
            else if ( sync_type == "ROW" )
            {
                switch ( table ){
                    case "TB_SITE" :
                        this.procTbSiteTblSync(ste_id, gtw_id, jsonMsg);
                        break;
                    case "TB_DEV" :
                        this.procTbDevRowSync(ste_id, gtw_id, op, jsonMsg);
                        break;
                    case "TB_GROUP" :
                        this.procTbGroupRowSync(ste_id, gtw_id, op, jsonMsg);
                        break;
                    case "TB_HOLIDAY" :
                        this.procTbHolidayRowSync(ste_id, gtw_id, op, jsonMsg);
                        break;
                    case "TB_SCHD" :
                        this.procTbSchdRowSync(ste_id, gtw_id, op, jsonMsg);
                        break;
                    case "TB_SCHD_TM" :
                        this.procTbSchdTmRowSync(ste_id, gtw_id, op, jsonMsg);
                        break;
                    default :
                        console.error("unknown gateway table name : " + table);
                }
            }
        }
        catch( reason )
        {
            throw reason;
        }
    }


    //TB_DEV == TB_DEVICE and TM_PLUG 테이블 동기화
    async procTbDevTblSync(ste_id, gtw_id, jsonMsg) {
        try{

            await db.updateTbDeviceAllDeleteStat(ste_id, gtw_id);        //삭제 상태로 모두 바꿈

            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){
                for ( let dev of jsonMsg.bd )
                {
                    let dev_id = dev['ZB_ADDR']  ;
                    await this.procTbDevUpdateOrInsert( ste_id, gtw_id, dev_id, dev ) ;
                }
            }

            await db.deleteTmSmartPlugStat9();  //상태 9삭제 처리
            // await db.deleteTbDeviceStat9();     //상태 9삭제 처리

        }catch( reason ){
            throw reason;
        }
    }
    //TB_DEV == TB_DEVICE and TM_PLUG 레코드 동기화
    async procTbDevRowSync(ste_id, gtw_id, op, jsonMsg) {

        try{
            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){

                for ( let dev of jsonMsg.bd )
                {
                    let dev_id = dev['ZB_ADDR'] ;
                    if( op == "UPDATE" || op == "INSERT")
                        await this.procTbDevUpdateOrInsert( ste_id, gtw_id, dev_id, dev ) ;
                    else if ( op == "DELETE")
                        await this.procTbDevDelete( ste_id, gtw_id, dev_id ) ;

                }
            }
        }catch( reason ){
            throw reason;
        }
    }
    //TB_DEV == TB_DEVICE and TM_PLUG 레코드 동기화 ( UPDATE or INSERT )
    async procTbDevUpdateOrInsert( ste_id, gtw_id, dev_id, dev )
    {
        let tbDevice  = { DEV_NM:dev['DEV_NM'], COM_ST:dev['DEV_ST'], RCV_DT:dev['RCV_DT'], RCV_TM:dev['RCV_TM'], STAT:1, EDT_DT:'NOW()' };

        let rtn = await db.updateTbDevice ( ste_id, gtw_id, dev_id, tbDevice );
        if( rtn <= 0 )
            rtn = await db.insertTbDevice ( ste_id, gtw_id, dev_id, tbDevice );

        let tmSmartPlug = {
            SW_ST:dev['SW_ST'] ,
            KW:dev['KW'],
            AKWH:dev['AKWH'],
            STBY_KW:dev['STBY_KW'],
            OFF_DELY:dev['OFF_DELY'],
            MANU_CTL_ALLOW:dev['MANU_CTL_ALLOW'],
            BIGO:dev['BIGO'],
            GRP_SQ:dev['GRP_SQ'],
            ZB_RGRP_RID:dev['ZB_RGRP_RID'],
            ZB_RGRP_AID:dev['ZB_RGRP_AID'],
            ZB_ONGRP_RID:dev['ZB_ONGRP_RID'],
            ZB_ONGRP_AID:dev['ZB_ONGRP_AID'],
            ZB_OFFGRP_RID:dev['ZB_OFFGRP_RID'],
            ZB_OFFGRP_AID:dev['ZB_OFFGRP_AID'],
            DATA_DT : "NOW()"
        } ;

        rtn = await db.updateTmSmartPlug ( ste_id, gtw_id, dev_id, tmSmartPlug );
        if( rtn <= 0 )
            rtn = await db.insertTmSmartPlug ( ste_id, gtw_id, dev_id, tmSmartPlug );
    }
    //TB_DEV == TB_DEVICE and TM_PLUG 레코드 동기화 ( DELETE)
    async procTbDevDelete( ste_id, gtw_id, dev_id ) {

        let rtn = await db.deleteTmSmartPlug ( ste_id, gtw_id, dev_id);

        rtn = await db.deleteTbDevice ( ste_id, gtw_id, dev_id );
    }



    // TB_SITE == TB_GATEWAY BIGO 컬럼 동기화
    async procTbSiteTblSync(ste_id, gtw_id, jsonMsg) {
        try {
            await db.updateTbGatewayBigo(ste_id, gtw_id, jsonMsg);        //비고만 수정 함.
        }catch( reason ){
            throw reason;
        }
    }




   //TB_GRUP ==> TM_GROUP 테이블 동기화
   async procTbGroupTblSync(ste_id, gtw_id, jsonMsg) {
    try{

            await db.updateTmGroupAllDeleteStat(ste_id, gtw_id);        //삭제 상태로 모두 바꿈

            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){
                for ( let row of jsonMsg.bd )
                {
                    let grp_sq = row['GRP_SQ']  ;
                    await this.procTmGroupUpdateOrInsert( ste_id, gtw_id, grp_sq, row ) ;
                }
            }

            await db.deleteTmGroupStat9();     //상태 9삭제 처리

        }catch( reason ){
            throw reason;
        }
    }
    //TB_GRUP ==> TM_GROUP 레코드 동기화
    async procTbGroupRowSync(ste_id, gtw_id, op, jsonMsg) {

        try{

            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){
                for ( let row of jsonMsg.bd )
                {
                    let grp_sq = row['GRP_SQ'] ;
                    if( op == "UPDATE" || op == "INSERT")
                        await this.procTmGroupUpdateOrInsert( ste_id, gtw_id, grp_sq, row ) ;
                    else if ( op == "DELETE")
                        await this.procTmGroupDelete( ste_id, gtw_id, grp_sq ) ;
                }
            }
        }catch( reason ){
            throw reason;
        }
    }
    //TB_GRUP ==> TM_GROUP 레코드 동기화 ( UPDATE or INSERT )
    async procTmGroupUpdateOrInsert( ste_id, gtw_id, grp_sq, row )
    {
        let nRow = {
            GRP_NM:row['GRP_NM'] ,
            STAT : 1
        } ;
        let rtn = await db.updateTmGroup ( ste_id, gtw_id, grp_sq, nRow );
        if( rtn <= 0 )
            rtn = await db.insertTmGroup ( ste_id, gtw_id, grp_sq, nRow );
    }
    //TB_GRUP ==> TM_GROUP 레코드 동기화 ( DELETE)
    async procTmGroupDelete( ste_id, gtw_id, grp_sq ) {

        let rtn = await db.deleteTmGroup ( ste_id, gtw_id, grp_sq );
    }




    //TB_HOLIDAY ==> TM_HOLIDAY 테이블 동기화
    async procTbHolidayTblSync(ste_id, gtw_id, jsonMsg) {
        try{

            await db.updateTmHolidayAllDeleteStat(ste_id, gtw_id);        //삭제 상태로 모두 바꿈

            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){

                for ( let row of jsonMsg.bd )
                {
                    let holi_dt = row['HOLI_DT']  ;
                    await this.procTmHolidayUpdateOrInsert( ste_id, gtw_id, holi_dt, row ) ;
                }
            }

            await db.deleteTmHolidayStat9();     //상태 9삭제 처리

        }catch( reason ){
            throw reason;
        }
    }
    //TB_HOLIDAY ==> TM_HOLIDAY 레코드 동기화
    async procTbHolidayRowSync(ste_id, gtw_id, op, jsonMsg) {

        try{
            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){
                for ( let row of jsonMsg.bd )
                {
                    let holi_dt = row['HOLI_DT'] ;
                    if( op == "UPDATE" || op == "INSERT")
                        await this.procTmHolidayUpdateOrInsert( ste_id, gtw_id, holi_dt, row ) ;
                    else if ( op == "DELETE")
                        await this.procTmHolidayDelete( ste_id, gtw_id, holi_dt ) ;
                }
            }
        }catch( reason ){
            throw reason;
        }
    }
    //TB_HOLIDAY ==> TM_HOLIDAY 레코드 동기화 ( UPDATE or INSERT )
    async procTmHolidayUpdateOrInsert( ste_id, gtw_id, holi_dt, row )
    {
        let nRow = {
            HOLI_NM:row['HOLI_NM'] ,
            STAT : 1
        } ;
        let rtn = await db.updateTmHoliday ( ste_id, gtw_id, holi_dt, nRow );
        if( rtn <= 0 )
            rtn = await db.insertTmHoliday ( ste_id, gtw_id, holi_dt, nRow );
    }
    //TB_HOLIDAY ==> TM_HOLIDAY 레코드 동기화 ( DELETE)
    async procTmHolidayDelete( ste_id, gtw_id, holi_dt ) {

        let rtn = await db.deleteTmHoliday ( ste_id, gtw_id, holi_dt );
    }




    //TB_SCHD ==> TM_SCHD 테이블 동기화
    async procTbSchdTblSync(ste_id, gtw_id, jsonMsg) {
        try{

            await db.updateTmSchdAllDeleteStat(ste_id, gtw_id);        //삭제 상태로 모두 바꿈

            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){

                for ( let row of jsonMsg.bd )
                {
                    let schd_sq = row['SCHD_SQ']  ;
                    await this.procTmSchdUpdateOrInsert( ste_id, gtw_id, schd_sq, row ) ;
                }
            }

            await db.deleteTmSchdStat9();     //상태 9삭제 처리

        }catch( reason ){
            throw reason;
        }
    }
    //TB_SCHD ==> TM_SCHD 레코드 동기화
    async procTbSchdRowSync(ste_id, gtw_id, op, jsonMsg) {

        try{
            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){

                for ( let row of jsonMsg.bd )
                {
                    let schd_sq = row['SCHD_SQ'] ;
                    if( op == "UPDATE" || op == "INSERT")
                        await this.procTmSchdUpdateOrInsert( ste_id, gtw_id, schd_sq, row ) ;
                    else if ( op == "DELETE")
                        await this.procTmSchdDelete( ste_id, gtw_id, schd_sq ) ;
                }
            }
        }catch( reason ){
            throw reason;
        }
    }
    //TB_SCHD ==> TM_SCHD 레코드 동기화 ( UPDATE or INSERT )
    async procTmSchdUpdateOrInsert( ste_id, gtw_id, schd_sq, row )
    {
        let nRow = {
            SCHD_NM:row['SCHD_NM'] ,
            GRP_SQ:row['GRP_SQ'] ,
            WEEK_BIT:row['WEEK_BIT'] ,
            HOLI_YN:row['HOLI_YN'] ,
            BIGO:row['BIGO'] ,
            STAT : 1
        } ;
        let  rtn = await db.updateTmSchd ( ste_id, gtw_id, schd_sq, nRow );
        if( rtn <= 0 )
            rtn = await db.insertTmSchd ( ste_id, gtw_id, schd_sq, nRow );
    }
    //TB_SCHD ==> TM_SCHD 레코드 동기화 ( DELETE)
    async procTmSchdDelete( ste_id, gtw_id, schd_sq )
    {
        let rtn = await db.deleteTmSchd ( ste_id, gtw_id, schd_sq );
    }




    //TB_SCHD_TM ==> TM_SCHD_TM 테이블 동기화
    async procTbSchdTmTblSync(ste_id, gtw_id, jsonMsg) {
        try{

            await db.updateTmSchdTmAllDeleteStat(ste_id, gtw_id);        //삭제 상태로 모두 바꿈

            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){
                for ( let row of jsonMsg.bd )
                {
                    let schd_tm_sq = row['SCHD_TM_SQ']  ;
                    await this.procTmSchdTmUpdateOrInsert( ste_id, gtw_id, schd_tm_sq, row ) ;
                }
            }

            await db.deleteTmSchdTmStat9();     //상태 9삭제 처리

        }catch( reason ){
            throw reason;
        }
    }
    //TB_SCHD_TM ==> TM_SCHD_TM 레코드 동기화
    async procTbSchdTmRowSync(ste_id, gtw_id, op, jsonMsg) {

        try{
            if( jsonMsg.bd && Array.isArray(jsonMsg.bd) ){

                for ( let row of jsonMsg.bd )
                {
                    let schd_tm_sq = row['SCHD_TM_SQ'] ;
                    if( op == "UPDATE" || op == "INSERT"){
                        await this.procTmSchdTmUpdateOrInsert( ste_id, gtw_id, schd_tm_sq, row ) ;
                    }else if ( op == "DELETE"){

                        let schd_tm_sq = row['SCHD_TM_SQ']
                        let schd_sq = row['SCHD_SQ']

                        await this.procTmSchdTmDelete( ste_id, gtw_id, schd_sq, schd_tm_sq ) ;

                    }

                }
            }
        }catch( reason ){
            throw reason;
        }
    }
    //TB_SCHD_TM ==> TM_SCHD_TM 레코드 동기화 ( UPDATE or INSERT )
    async procTmSchdTmUpdateOrInsert( ste_id, gtw_id, schd_tm_sq, row )
    {
        let nRow = {
            SCHD_SQ:row['SCHD_SQ'] ,
            CTL_TIME:row['CTL_TIME'] ,
            CTL_CMD:row['CTL_CMD'] ,
            LAST_RUN_DT:row['LAST_RUN_DT'] ,
            STAT : 1
        };
        let rtn = await db.updateTmSchdTm ( ste_id, gtw_id, schd_tm_sq, nRow );
        if( rtn <= 0 )
            rtn = await db.insertTmSchdTm ( ste_id, gtw_id, schd_tm_sq, nRow );
    }
    //TB_SCHD_TM ==> TM_SCHD_TM 레코드 동기화 (DELETE)
    async procTmSchdTmDelete( ste_id, gtw_id, schd_sq, schd_tm_sq )
    {
        let rtn = await db.deleteTmSchdTm ( ste_id, gtw_id, schd_sq, schd_tm_sq );
    }











    //보고서처리
    async procReport(ste_id, gtw_id, jsonMsg) {

        try {
            let table       = jsonMsg.hd.table    ;   //테이블명

            console.debug( JSON.stringify(jsonMsg));

            //보고서 DB (TR_DAY, TR_HOUR, TR_SW_EVENT, TR_CTRL)
            switch ( table ){
                case "TR_DAY" :
                    this.procTrDay(ste_id, gtw_id, jsonMsg);
                    break;
                case "TR_HOUR" :
                    this.procTrHour(ste_id, gtw_id, jsonMsg);
                    break;
                case "TR_SW_EVNT" :
                    this.procTrSwEvnt(ste_id, gtw_id, jsonMsg);
                    break;
                case "TR_CTRL" :
                    this.procTrCtrl(ste_id, gtw_id, jsonMsg);
                    break;
                default :
                    console.error("unknown gateway table name : " + table);
            }
        }
        catch( reason )
        {
            throw reason;
        }
    }



    //TR_DAY ==> TR_DAY 테이블 동기화
    async procTrDay(ste_id, gtw_id, jsonMsg) {
        try{

            let row = jsonMsg.bd ;

            let zb_addr = row['ZB_ADDR']  ;
            let tx_dt   = row['TX_DT']  ;

            await this.procTrDayInsertOrUpdate( ste_id, gtw_id, zb_addr, tx_dt, row ) ;

        }catch( reason ){
            throw reason;
        }
    }
    async procTrDayInsertOrUpdate( ste_id, gtw_id, zb_addr, tx_dt, row )
    {
        let nRow = {
            S_AKWH:row['S_AKWH'] ,
            E_AKWH:row['E_AKWH'] ,
            SAVE_KW:row['SAVE_KW'] ,
            SAVE_SEC:row['SAVE_SEC']
        };
        await db.insertOrUpdateTrDay ( ste_id, gtw_id, zb_addr, tx_dt, nRow );
    }




    //TR_HOUR ==> TR_HOUR 테이블 동기화
    async procTrHour(ste_id, gtw_id, jsonMsg) {
        try{

            let row = jsonMsg.bd ;

            let zb_addr = row['ZB_ADDR']  ;
            let tx_dt   = row['TX_DT']  ;
            let tx_tm   = row['TX_TM']  ;

            await this.procTrHourInsertOrUpdate( ste_id, gtw_id, zb_addr, tx_dt, tx_tm, row ) ;

        }catch( reason ){
            throw reason;
        }
    }
    async procTrHourInsertOrUpdate( ste_id, gtw_id, zb_addr, tx_dt, tx_tm,  row )
    {
        let nRow = {
            S_AKWH:row['S_AKWH'] ,
            E_AKWH:row['E_AKWH']
        };
        await db.insertOrUpdateTrHour ( ste_id, gtw_id, zb_addr, tx_dt, tx_tm, nRow );
    }



    //TR_SW_EVNT ==> TR_SW_EVNT 테이블 동기화
    async procTrSwEvnt(ste_id, gtw_id, jsonMsg) {
        try{

            let row = jsonMsg.bd ;

            let zb_addr = row['ZB_ADDR']  ;
            let tx_dt   = row['TX_DT']  ;
            let tx_tm   = row['TX_TM']  ;

            await this.procTrSwEvntInsertOrUpdate( ste_id, gtw_id, zb_addr, tx_dt, tx_tm, row ) ;

        }catch( reason ){
            throw reason;
        }
    }
    async procTrSwEvntInsertOrUpdate( ste_id, gtw_id, zb_addr, tx_dt, tx_tm, row )
    {
        let nRow = {
            SW_ST:row['SW_ST'] ,
            SAVE_KW:row['SAVE_KW'],
            SAVE_SEC:row['SAVE_SEC']
        };
        await db.insertOrUpdateTrSwEvnt ( ste_id, gtw_id, zb_addr, tx_dt, tx_tm, nRow );
    }



    //TR_CTRL ==> TR_CTRL 테이블 동기화
    async procTrCtrl(ste_id, gtw_id, jsonMsg) {
        try{

            let row = jsonMsg.bd ;
            let ctl_sq = row['CTL_SQ']  ;

            await this.procTrCtrlInsertOrUpdate( ste_id, gtw_id, ctl_sq, row ) ;

        }catch( reason ){
            throw reason;
        }
    }
    async procTrCtrlInsertOrUpdate( ste_id, gtw_id, ctl_sq, row )
    {
        let nRow = {
            CTL_DT:row['CTL_DT'] ,
            CTL_TM:row['CTL_TM'],
            ZB_ADDR:row['ZB_ADDR'],
            GRP_SQ:row['GRP_SQ'],
            CTL_TYPE:row['CTL_TYPE'],
            CTL_OBJ:row['CTL_OBJ'],
            CTL_CMD:row['CTL_CMD'],
            SCHD_TM_SQ:row['SCHD_TM_SQ'],
            SCHD_SQ:row['SCHD_SQ'],
            KW:row['KW']
        };
        await db.inserinsertOrUpdateTrCtrl ( ste_id, gtw_id, ctl_sq, nRow );
    }
}





module.exports = new GatewayMessage();

