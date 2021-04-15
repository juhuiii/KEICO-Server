'use strict';

const mariadb   = require('mariadb');
const config    = require("config");
const utils     = require("../utils/utils");

const pool = mariadb.createPool({
    host: config.get('db.host'),
    port:config.get('db.port'),
    user: config.get('db.user'),
    password: config.get('db.pwd'),
    database: config.get('db.dbname'),
    connectionLimit: 30
});


const qrOwners      = require('./qr_owners');
const qrSites       = require('./qr_sites');
const qrUsers       = require('./qr_users');
const qrPlugs       = require('./qr_plugs');
const qrReports     = require('./qr_reports');
const qrGateways    = require('./qr_gateways');

class Database {

    constructor(){

        console.info( "[database] Created " );
    }


    /**
     *
     *  모바일로 부터 수신된 데이터 처리 로직
     *
     */
    //////////////////////////////////////////// MOBILE REST API ////////////////////////////////////////////
    //////////////////////////////////////////// MOBILE REST API ////////////////////////////////////////////
    //////////////////////////////////////////// MOBILE REST API ////////////////////////////////////////////
    //현장정보 목록 또는 상세 조회
    async selectSite( ste_id, own_sq ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT STE_SQ
                , OWN_SQ
                , STE_ID
                , STE_NM
                , DATE_FORMAT( INS_DT, '%Y-%m-%d %H:%i:%s' ) INS_DT
                , TEL_NO
                , ADDR
            FROM TB_SITE
            WHERE STAT = 1`;

            if( utils.isNotEmpty( ste_id  ) ) sql += ` AND STE_ID  = '${ste_id}'`
            if( utils.isNotEmpty( own_sq  ) ) sql += ` AND OWN_SQ  =  ${own_sq}`

            rows = await conn.query(sql);
            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }







    //게이트웨이 목록 조회(특정 현장내)
    async selectGateways( ste_id, gtw_id ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT
                GTW_SQ,
                STE_ID,
                GTW_ID,
                GTW_NM,
                HW_MDL_CD,
                SW_MDL_CD,
                BIGO,
                RCV_DT
            FROM TB_GATEWAY
            WHERE STAT = 1`
             if( ste_id ) sql += ` AND STE_ID = '${ste_id}'`;
             if( gtw_id ) sql += ` AND GTW_ID = '${gtw_id}'`;

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }








    //그룹사용자 또는 현장사용자 조회
    async selectUser( user_id, usr_gb = 1 ){
        let sql = qrUsers.selectUser(user_id, usr_gb );
        return  this.doSqlCommon( sql );
    }


    //사용자 조회 (모바일 또는 현장 사용자 )
    async selectUserSite( user_id ){
        let sql = qrUsers.selectUser(user_id, 1 );
        return  this.doSqlCommon( sql );
    }


     //사용자정보 변경
     async updateUser( user_id, usr_nm, pwd ) {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TB_USER SET USR_NM = '${usr_nm}', PWD = '${pwd}', EDT_DT = NOW()
                        WHERE USR_ID = '${user_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    //사용자 비밀번혼 변경
    async updateUserPassword( user_id, pwd ){
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TB_USER SET PWD = '${pwd}', EDT_DT = NOW()
                        WHERE USR_ID = '${user_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    //사용자 최종 접속시간
    async updateUserAcceptime( user_id ){
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TB_USER SET ACC_DT = NOW()
                        WHERE USR_ID = '${user_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }



    //플러그 목록  조회
    async selectPlugs( ste_id = null, gtw_id = null , dev_id = null){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT
                D.DEV_SQ,
                D.STE_ID,
                D.GTW_ID,
                D.DEV_ID,
                D.DEV_NM,
                D.KND_CD,
                D.MDL_CD,
                D.COM_ST,
                D.STAT,
                M.SW_ST,
                M.KW,
                M.AKWH,
                M.STBY_KW,
                M.OFF_DELY,
                M.MANU_CTL_ALLOW,
                M.GRP_SQ,
                M.ZB_RGRP_RID,
                M.ZB_ONGRP_RID,
                M.ZB_OFFGRP_RID,
                M.ZB_RGRP_AID,
                M.ZB_ONGRP_AID,
                M.ZB_OFFGRP_AID
            FROM TB_DEVICE D JOIN TM_PLUG M ON D.STE_ID = M.STE_ID AND D.GTW_ID = M.GTW_ID AND D.DEV_ID = M.DEV_ID
            WHERE D.STAT = 1 `

            if( ste_id  ) sql += ` AND D.STE_ID = '${ste_id}'`

            if( gtw_id ) sql += ` AND D.GTW_ID = '${gtw_id}'`

            if( dev_id ) sql += ` AND D.DEV_ID = '${dev_id}'`

            sql += ` ORDER BY D.DEV_NM `;


            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }



    //그룹내 플러그 조회 ( 2020-06 OK )
    async selectPlugsByOwner( own_sq , ste_sq ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = qrPlugs.selectPlugsByOwner(own_sq, ste_sq);

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }





    //그룹설정 조회
    async selectPlugGroups( ste_id, gtw_id, grp_sq = null ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT
                STE_ID,
                GTW_ID,
                GRP_SQ,
                GRP_NM
            FROM TM_GROUP
            WHERE STAT = 1 AND  STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' `;
            if( grp_sq )
                sql += ` AND GRP_SQ = '${grp_sq}' `;

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    //휴일 설정 조회
    async selectHolidays( ste_id, gtw_id, hoil_dt = null ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT
                STE_ID,
                GTW_ID,
                HOLI_DT,
                HOLI_NM
            FROM TM_HOLIDAY
            WHERE STAT = 1 AND  STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' `;
            if( hoil_dt )
                sql += ` AND HOLI_DT = '${hoil_dt}' `;

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }




    //스케쥴 설정 조회
    async selectSchedules( ste_id, gtw_id, schd_sq = null, grp_sq = null ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT
                STE_ID,
                GTW_ID,
                SCHD_SQ,
                SCHD_NM,
                GRP_SQ,
                WEEK_BIT,
                HOLI_YN,
                BIGO
            FROM TM_SCHD
            WHERE STAT = 1 AND  STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' `;
            if( schd_sq )   sql += ` AND SCHD_SQ = '${schd_sq}' `;
            if( grp_sq )    sql += ` AND GRP_SQ  = '${grp_sq}' ` ;

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    //시간 스케쥴 설정 조회
    async selectScheduleTms( ste_id, gtw_id, schd_tm_sq = null, schd_sq = null ){
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = ` SELECT  SC.STE_ID, SC.GTW_ID, SC.SCHD_SQ, SC.GRP_SQ, SC.SCHD_NM, SC.WEEK_BIT, SC.HOLI_YN, TM.SCHD_TM_SQ, TM.CTL_TIME, TM.CTL_CMD ` +
                      ` FROM TM_SCHD_TM TM JOIN TM_SCHD SC ` +
                      ` ON SC.STE_ID = TM.STE_ID AND SC.GTW_ID = TM.GTW_ID AND SC.SCHD_SQ = TM.SCHD_SQ ` +
                      ` WHERE SC.STAT = 1 AND TM.STAT = 1 AND  SC.STE_ID = '${ste_id}' AND SC.GTW_ID = '${gtw_id}' `;

            if( schd_sq    )   sql += ` AND SC.SCHD_SQ = '${schd_sq}' `;
            if( schd_tm_sq )   sql += ` AND TM.SCHD_TM_SQ  = '${schd_tm_sq}' ` ;

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }




    //시보고서 (현장별, 게이트웨이별 )
    async selectHourReport( ste_id, gtw_id, fr_date, to_date )
    {
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT ` +
                `   STE_ID ` +
                `   , GTW_ID `+
                `   , TX_DT `+
                `   , TX_TM `+
                `   , SUM(S_AKWH) S_AKWH `+
                `   , SUM(E_AKWH) E_AKWH `+
                `   , SUM(E_AKWH) - SUM(S_AKWH) SKWH `+
                `FROM TR_HOUR `;

            let where = `WHERE STE_ID = '${ste_id}' AND TX_DT >= ${fr_date} AND TX_DT <= ${to_date} ` ;
            if( gtw_id )  where += ` AND GTW_ID = '${gtw_id}' `;

            let group = ` GROUP BY STE_ID  `;
            if( gtw_id )  group += `, GTW_ID`;
            group += `, TX_DT , TX_TM `;

            sql = sql + where + group + " ORDER BY TX_DT DESC, TX_TM DESC ";

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }






    //일보고서 (현장별, 게이트웨이별 )
    async selectDayReport( ste_id, gtw_id, fr_date, to_date )
    {
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = `SELECT ` +
                `   STE_ID ` +
                `   , GTW_ID `+
                `   , TX_DT `+
                `   , SUM(S_AKWH) S_AKWH `+
                `   , SUM(E_AKWH) E_AKWH `+
                `   , SUM(E_AKWH) - SUM(S_AKWH) SKWH `+
                `   , SUM(SAVE_KW) SAVE_KW `+
                `   , SUM(SAVE_SEC) SAVE_SEC `+
                `FROM TR_DAY `;

            let where = `WHERE STE_ID = '${ste_id}' AND TX_DT >= ${fr_date} AND TX_DT <= ${to_date} ` ;
            if( gtw_id )  where += ` AND GTW_ID = '${gtw_id}' `;

            let group = ` GROUP BY STE_ID  `;
            if( gtw_id )  group += `, GTW_ID`;
            group += `, TX_DT  `;

            sql = sql + where + group + " ORDER BY TX_DT DESC ";

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }











    //월보고서 (현장별, 게이트웨이별 )fsd
    async selectMonthReport( ste_id, gtw_id, fr_month, to_month )
    {
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = ` SELECT STE_ID ` +
                `   , GTW_ID ` +
                `   , CAST(((TX_DT)/100) AS UNSIGNED ) TX_DT ` +
                `   , SUM(S_AKWH) S_AKWH ` +
                `   , SUM(E_AKWH) E_AKWH ` +
                `   , SUM(E_AKWH) - SUM(S_AKWH) SKWH ` +
                `   , SUM(SAVE_KW) SAVE_KW ` +
                `   , SUM(SAVE_SEC) SAVE_SEC ` +
                ` FROM TR_DAY  ` ;

            let where = `WHERE STE_ID = '${ste_id}' AND CAST(((TX_DT)/100) AS UNSIGNED) >= ${fr_month} AND CAST(((TX_DT)/100) AS UNSIGNED ) <= ${to_month} ` ;
            if( gtw_id )  where += ` AND GTW_ID = '${gtw_id}' `;

            let group = ` GROUP BY STE_ID  `;
            if( gtw_id )  group += `, GTW_ID`;
            group += `, CAST(((TX_DT)/100) AS UNSIGNED)  `;

            sql = sql + where + group + " ORDER BY CAST(((TX_DT)/100) AS UNSIGNED) DESC ";

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }

    //플러그 ON/OFF 동작이력 (현장별, 게이트웨이별, 플러그별  )
    async selectSwEvntReport( own_sq, ste_sq, gtw_sq, dev_sq, fr_date, to_date)
    {
        let sql = qrReports.selectSwEvntReport( own_sq, ste_sq, gtw_sq, dev_sq, fr_date, to_date)
        return  this.doSqlCommon( sql );
    }

    //제어 이력 (조건 : 오너, 현장, 게이트웨, 플러그, 제어일자  )
    async selectControlReport( own_sq, ste_sq, gtw_sq, dev_sq, fr_date, to_date)
    {
        let sql = qrReports.selectControlReport( own_sq, ste_sq, gtw_sq, dev_sq, fr_date, to_date)
        return  this.doSqlCommon( sql );
    }

    //지그비 그룹핑 진행상태
    async selectZbGroupingStat(ste_id, gtw_id) {
        let conn, rows;
        try
        {
            conn = await pool.getConnection();

            let sql = ` SELECT SUM(ONGRP)  ONGRP_SYNC_CNT ` +
            `         , SUM(OFFGRP) OFFGRP_SYNC_CNT ` +
            `         , SUM(READGRP) READGRP_SYNC_CNT ` +
            `         , COUNT(*) TOT_DEV_CNT ` +
            `         , SUM(ONGRP_DEV) ONGRP_DEV_CNT ` +
            `         , SUM(OFFGRP_DEV) OFFGRP_DEV_CNT ` +
            `         , SUM(RGRP_DEV) READGRP_DEV_CNT ` +
            ` FROM ( ` +
            ` SELECT ` +
            `       CASE WHEN ZB_ONGRP_AID  = ZB_ONGRP_RID  THEN 1 ELSE 0 END ONGRP ` +
            `     , CASE WHEN ZB_OFFGRP_AID = ZB_OFFGRP_RID THEN 1 ELSE 0 END OFFGRP ` +
            `     , CASE WHEN ZB_RGRP_AID   = ZB_RGRP_RID THEN 1 ELSE 0 END READGRP ` +
            `     , CASE WHEN ZB_ONGRP_RID   > 0 THEN 1 ELSE 0 END ONGRP_DEV ` +
            `     , CASE WHEN ZB_OFFGRP_RID  > 0 THEN 1 ELSE 0 END OFFGRP_DEV ` +
            `     , CASE WHEN ZB_RGRP_RID    > 0 THEN 1 ELSE 0 END RGRP_DEV ` +
            ` FROM TM_PLUG ` +
            ` WHERE STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' ` +
            ` )IN_T `;

            rows = await conn.query(sql);

            return rows;
        }
        catch(err){
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }










    /*******************************************************************************
     *  오너단위 보고서 정보
     *******************************************************************************/

    //시간보고서 ( 지정된 단일오너 )
    async selectHourReportByOwner( own_sq, fr_date, to_date )
    {
        let sql = qrReports.selectHourReportByOwner( own_sq, fr_date, to_date )
        return  this.doSqlCommon( sql );
    }

     //일간보고서 ( 지정된 단일오너 )
     async selectDayReportByOwner( own_sq, fr_date, to_date )
     {
        let sql = qrReports.selectDayReportByOwner( own_sq, fr_date, to_date )
        return  this.doSqlCommon( sql );
     }

     //월간보고서 ( 지정된 단일오너 )
     async selectMonthReportByOwner( own_sq, fr_month, to_month )
     {
        let sql = qrReports.selectMonthReportByOwner( own_sq, fr_month, to_month )
        return  this.doSqlCommon( sql );
     }


    /*******************************************************************************
     *  현장단위 보고서 정보
     *******************************************************************************/
    //시간보고서 ( 지정된 단일현장 )
    async selectHourReportBySite( ste_sq, fr_date, to_date )
    {
        let sql = qrReports.selectHourReportBySite( ste_sq, fr_date, to_date );
        return  this.doSqlCommon( sql );
    }

    //일간보고서 ( 지정된 단일현장 )
    async selectDayReportBySite( ste_sq, fr_date, to_date )
    {
        let sql = qrReports.selectDayReportBySite( ste_sq, fr_date, to_date );
        return  this.doSqlCommon( sql );
    }

    //월간보고서 ( 지정된 단일현장 )
    async selectMonthReportBySite( ste_sq, fr_month, to_month )
    {
        let sql = qrReports.selectMonthReportBySite( ste_sq, fr_month, to_month );
        return  this.doSqlCommon( sql );
    }



    /*******************************************************************************
     *  오너단위  정보
     *******************************************************************************/
    //OWNER  목록 조회
    async selectOwners( own_sq = null)
    {
        let sql = qrOwners.selectOnwers(own_sq);
        return  this.doSqlCommon( sql );
    }

    //후손 Owners
    async selectOnwersOffspring( own_sq, with_me = false )
    {
        let sql = qrOwners.selectOnwersOffspring(own_sq, with_me );
        return  this.doSqlCommon( sql );
    }

    //자식 Owners (바로자식만)
    async selectOnwersChild( own_sq, with_me = false )
    {
        let sql = qrOwners.selectOnwersChild(own_sq, with_me );
        return  this.doSqlCommon( sql );
    }

    //부모 Onwers
    async selectOnwersParent( own_sq, with_me = true  ) {
        let sql = qrOwners.selectOnwersParent(own_sq, with_me );
        return  this.doSqlCommon( sql );
    }



    /*******************************************************************************
     *  현장단위  정보
     *******************************************************************************/
    //지정된 그룹의 자손 또는 자식 현장목록 (계측값포함 )
    async selectSitesWithMeas( own_sq , ste_sq = null, withOffstring = false)
    {
        let sql = qrOwners.selectSitesWithMeas(own_sq, ste_sq, withOffstring );
        return  this.doSqlCommon( sql );
    }

    // 지정된 그룹에 자식 현장목록 + 플러그계측값
    async selectSiteMeas( own_sq, ste_sq ){

        let sql = qrSites.selectSitesWithMeas(own_sq, ste_sq ) ;
        return  this.doSqlCommon( sql );
    }

    //지정된 그룹의 자식 현장 목록
    async selectSites( own_sq = null , ste_sq = null)
    {
        let sql = qrSites.selectSites(own_sq, ste_sq );
        return  this.doSqlCommon( sql );

    }

    //현장정보 등록
    async insertSite(  vals  ){
        try {
            let rtn = await this.doInsertCommon("TB_SITE",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }

    //현장정보 업데이트
    async updateSite( ste_sq,  vals  ){
        try {
            let where = { STE_SQ:ste_sq };
            let rtn = await this.doUpdateCommon("TB_SITE", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    //현장 정보 삭제
    async deleteSite ( ste_sq ){

        try {
            let vals  = { STAT : 0 }
            let where = { STE_SQ:ste_sq };

            let rtn = await this.doUpdateCommon("TB_SITE", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }



    /*******************************************************************************
     *  사용자단위   정보
     *******************************************************************************/
     //지정된 그룹의  자식 현장사용자 조회
    async selectSiteUserByOwner( own_sq ){
        let sql = qrUsers.selectSiteUserByOwner(own_sq );
        return  this.doSqlCommon( sql );
    }


    //사용자 정보 상세
    async selectUserByUsrSq( usr_sq ){

        let sql = qrUsers.selectUserByUsrSq( usr_sq );
        return  this.doSqlCommon( sql );

    }


    //사용자정보 등록
    async insertUser(  vals  )
    {
        try {
            let rtn = await this.doInsertCommon("TB_USER",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }

    //사용자정보 업데이트
    async updateUserBySq( usr_sq,  vals  )
    {
        try {
            let where = { USR_SQ:usr_sq };
            let rtn = await this.doUpdateCommon("TB_USER", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    //사용자정보 삭제
    async deleteUser ( usr_sq )
    {
        try {
            let vals  = { STAT : 0 }
            let where = { USR_SQ:usr_sq };

            let rtn = await this.doUpdateCommon("TB_USER", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }




    /*******************************************************************************
     *  게이트웨이단위  정보
     *******************************************************************************/
    //게이트웨이 목록 조회 ( 지정된 오너 또는 현장 )
    async selectGatewaysBySiteOwner( own_sq, ste_sq ){

        let sql = qrGateways.selectGateways(own_sq, ste_sq );
        return  this.doSqlCommon( sql );
    }


    //게이트웨이 상세 조회 (  )
    async selectGatewaysByGtwSq( gtw_sq ){

        let sql = qrGateways.selectGateways(null, null, gtw_sq );
        return  this.doSqlCommon( sql );
    }


    //게이트웨이 등록
    async insertGateway(  vals  ){
        try {
            let rtn = await this.doInsertCommon("TB_GATEWAY",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }

    //게이트웨이 업데이트
    async updateGateway( gtw_sq, vals ){
        try {
            let where = { GTW_SQ:gtw_sq };
            let rtn = await this.doUpdateCommon("TB_GATEWAY", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    //게이트웨이 삭제
    async deleteGateway ( gtw_sq ){

        try {
            let vals  = { STAT : 0 }
            let where = { GTW_SQ:gtw_sq };

            let rtn = await this.doUpdateCommon("TB_GATEWAY", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }































    /**
     *
     *  게이트웨이의 Adateper 메세지를 처리하는 함수들
     *
     */
    //////////////////////////////////////////// Adapter Message Proc ////////////////////////////////////////////
    //////////////////////////////////////////// Adapter Message Proc ////////////////////////////////////////////
    //////////////////////////////////////////// Adapter Message Proc ////////////////////////////////////////////

     //최종 수신일시 업데이트
     async updateDeviceRcvDt(ste_id, gtw_id, dev_id )
     {
         let conn, res;
         try
         {
             conn = await pool.getConnection();

             let sql = `UPDATE TB_DEVICE SET COM_ST = 1, EDT_DT = NOW()
                        WHERE STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' AND DEV_ID = '${dev_id}'`;

             res = await conn.query(sql);

             return res.affectedRows;
         }
         catch(err){
             console.error(  err );
             throw err;
         }
         finally{
             if (conn) conn.release();
         }
     }


     // 신규 장비추가
     async insertDevice(ste_id, gtw_id, dev_id )
     {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `INSERT INTO TB_DEVICE ( STE_ID, GTW_ID, DEV_ID, DEV_NM)  VALUES ( ?, ?, ?, ? )`;

            res = await conn.query(sql ,[ste_id, gtw_id, dev_id, dev_id ]);

            return res.insertId;
        }
        catch(err){
            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
     }



    // 신규 플러그 추가
    async insertTmSmartPlug(ste_id, gtw_id, dev_id )
    {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `INSERT INTO TM_PLUG ( STE_ID, GTW_ID, DEV_ID)  VALUES ( ?, ?, ? )`;

            res = await conn.query(sql ,[ste_id, gtw_id, dev_id ]);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }




    //플러그 ONOFF상태 업데이트
    async updatePlugOnOff( ste_id, gtw_id, dev_id, sw_st )
    {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TM_PLUG SET SW_ST = ${sw_st} , DATA_DT = NOW()
                       WHERE STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' AND DEV_ID = '${dev_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }



    //플러그 KW 업데이트
    async updatePlugKw( ste_id, gtw_id, dev_id, kw )
    {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TM_PLUG SET KW = ${kw} , DATA_DT = NOW()
                       WHERE STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' AND DEV_ID = '${dev_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    //플러그 KWH 업데이트
    async updatePlugKwh( ste_id, gtw_id, dev_id, kwh)
    {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TM_PLUG SET AKWH = ${kwh} , DATA_DT = NOW()
                       WHERE STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' AND DEV_ID = '${dev_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    //플러그 ZB_GROUP
    async updatePlugZbGroup( ste_id, gtw_id, dev_id, zbgroup)
    {
        let conn, res;
        try
        {
            conn = await pool.getConnection();

            let sql = `UPDATE TM_PLUG SET ZB_GROUP = '${zbgroup}', DATA_DT = NOW()
                       WHERE STE_ID = '${ste_id}' AND GTW_ID = '${gtw_id}' AND DEV_ID = '${dev_id}'`;

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err)
        {
            console.error(  err );
            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }




    /**
     *
     *  게이트웨이의 DB변경 메세지를 처리하는 함수들
     *
     */
    //////////////////////////////////////////// TABLE or ROW SYNC ////////////////////////////////////////////
    //////////////////////////////////////////// TABLE or ROW SYNC ////////////////////////////////////////////
    //////////////////////////////////////////// TABLE or ROW SYNC ////////////////////////////////////////////

    //모든상태를 삭제상태로 변경
    async updateTbDeviceAllDeleteStat( ste_id, gtw_id )
    {
        try {
            let value = { STAT : 9 , EDT_DT : "NOW()" };
            let where = { STE_ID : ste_id, GTW_ID : gtw_id, STAT : 1 };
            let rtn = await this.doUpdateCommon("TB_DEVICE", value, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async updateTbDevice( ste_id, gtw_id, dev_id, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, DEV_ID:dev_id };
            let rtn = await this.doUpdateCommon("TB_DEVICE",   vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async insertTbDevice ( ste_id, gtw_id, dev_id, vals )
    {
        try {
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['DEV_ID'] = dev_id;
            let rtn = await this.doInsertCommon("TB_DEVICE",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTbDevice ( ste_id, gtw_id, dev_id )
    {
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['DEV_ID'] = dev_id;
            let rtn = await this.doDeleteCommon("TB_DEVICE",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTbDeviceStat9(){
        try {
            let vals = {};
            vals['STAT'] = 9;
            let rtn = await this.doDeleteCommon("TB_DEVICE",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    //플러그 데이터
    async updateTmSmartPlug ( ste_id, gtw_id, dev_id, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, DEV_ID:dev_id };
            let rtn = await this.doUpdateCommon("TM_PLUG",  vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async insertTmSmartPlug ( ste_id, gtw_id, dev_id, vals )
    {
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['DEV_ID'] = dev_id;
            let rtn = await this.doInsertCommon("TM_PLUG",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmSmartPlug ( ste_id, gtw_id, dev_id ){
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['DEV_ID'] = dev_id;

            let rtn = await this.doDeleteCommon("TM_PLUG",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmSmartPlugStat9(){
        try {
            let sql = "DELETE FROM TM_PLUG WHERE ( STE_ID, GTW_ID, DEV_ID ) IN ( SELECT STE_ID, GTW_ID, DEV_ID FROM TB_DEVICE WHERE STAT = 9 )";
            let rtn = await this.doSqlCommon(sql);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    // TB_GATEWAY BIGO수정
    async updateTbGatewayBigo( ste_id, gtw_id, jsonMsg )
    {
        try {
            let vals = {
                BIGO : JSON.stringify(jsonMsg['bd'][0])
            };  //Gate

            let where = { STE_ID:ste_id, GTW_ID:gtw_id };
            let rtn = await this.doUpdateCommon("TB_GATEWAY",   vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }




    //모든상태를 삭제상태로 변경
    async updateTmGroupAllDeleteStat( ste_id, gtw_id )
    {
        try {
            let value = { STAT : 9 };
            let where = { STE_ID : ste_id, GTW_ID : gtw_id };
            let rtn = await this.doUpdateCommon("TM_GROUP", value, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async updateTmGroup( ste_id, gtw_id, grp_sq, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, GRP_SQ:grp_sq };
            let rtn = await this.doUpdateCommon("TM_GROUP", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async insertTmGroup ( ste_id, gtw_id, grp_sq, vals )
    {
        try {
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['GRP_SQ'] = grp_sq;
            let rtn = await this.doInsertCommon("TM_GROUP",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmGroup ( ste_id, gtw_id, grp_sq )
    {
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['GRP_SQ'] = grp_sq;
            let rtn = await this.doDeleteCommon("TM_GROUP",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmGroupStat9(){
        try {
            let vals = {};
            vals['STAT'] = 9;
            let rtn = await this.doDeleteCommon("TM_GROUP",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }





    //휴일설정 정보 모든상태를 삭제상태로 변경
    async updateTmHolidayAllDeleteStat( ste_id, gtw_id )
    {
        try {
            let value = { STAT : 9 };
            let where = { STE_ID : ste_id, GTW_ID : gtw_id };
            let rtn = await this.doUpdateCommon("TM_HOLIDAY", value, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async updateTmHoliday( ste_id, gtw_id, holi_dt, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, HOLI_DT:holi_dt };
            let rtn = await this.doUpdateCommon("TM_HOLIDAY", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async insertTmHoliday ( ste_id, gtw_id, holi_dt, vals )
    {
        try {
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['HOLI_DT'] = holi_dt;
            let rtn = await this.doInsertCommon("TM_HOLIDAY",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmHoliday ( ste_id, gtw_id, holi_dt )
    {
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['HOLI_DT'] = holi_dt;
            let rtn = await this.doDeleteCommon("TM_HOLIDAY",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmHolidayStat9(){
        try {
            let vals = {};
            vals['STAT'] = 9;
            let rtn = await this.doDeleteCommon("TM_HOLIDAY",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }





    //일간스케쥴설정 모든상태를 삭제상태로 변경
    async updateTmSchdAllDeleteStat( ste_id, gtw_id )
    {
        try {
            let value = { STAT : 9 };
            let where = { STE_ID : ste_id, GTW_ID : gtw_id };
            let rtn = await this.doUpdateCommon("TM_SCHD", value, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async updateTmSchd( ste_id, gtw_id, schd_sq, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, SCHD_SQ:schd_sq };
            let rtn = await this.doUpdateCommon("TM_SCHD", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async insertTmSchd ( ste_id, gtw_id, schd_sq, vals )
    {
        try {
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['SCHD_SQ'] = schd_sq;
            let rtn = await this.doInsertCommon("TM_SCHD",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmSchd ( ste_id, gtw_id, schd_sq )
    {
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['SCHD_SQ'] = schd_sq;
            let rtn = await this.doDeleteCommon("TM_SCHD",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmSchdStat9(){
        try {
            let vals = {};
            vals['STAT'] = 9;
            let rtn = await this.doDeleteCommon("TM_SCHD",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }






    //시간스케쥴설정 모든상태를 삭제상태로 변경
    async updateTmSchdTmAllDeleteStat( ste_id, gtw_id )
    {
        try {
            let value = { STAT : 9 };
            let where = { STE_ID : ste_id, GTW_ID : gtw_id };
            let rtn = await this.doUpdateCommon("TM_SCHD_TM", value, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async updateTmSchdTm( ste_id, gtw_id, schd_tm_sq, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, SCHD_TM_SQ:schd_tm_sq };
            let rtn = await this.doUpdateCommon("TM_SCHD_TM", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async insertTmSchdTm ( ste_id, gtw_id, schd_tm_sq, vals )
    {
        try {
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            vals['SCHD_TM_SQ'] = schd_tm_sq;
            let rtn = await this.doInsertCommon("TM_SCHD_TM",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmSchdTm ( ste_id, gtw_id, schd_sq, schd_tm_sq )
    {
        try {
            let vals = {};
            vals['STE_ID'] = ste_id;
            vals['GTW_ID'] = gtw_id;
            if( schd_sq )    vals['SCHD_SQ'] = schd_sq;
            if( schd_tm_sq ) vals['SCHD_TM_SQ'] = schd_tm_sq;
            let rtn = await this.doDeleteCommon("TM_SCHD_TM",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }
    async deleteTmSchdTmStat9(){
        try {
            let vals = {};
            vals['STAT'] = 9;
            let rtn = await this.doDeleteCommon("TM_SCHD_TM",  vals);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }






    //일보고서
    async insertOrUpdateTrDay( ste_id, gtw_id, zb_addr, tx_dt, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, ZB_ADDR:zb_addr, TX_DT: tx_dt};
            let rtn = await this.doInsertOrUpdateCommon("TR_DAY", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    //시간보고서
    async insertOrUpdateTrHour( ste_id, gtw_id, zb_addr, tx_dt, tx_tm, vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, ZB_ADDR:zb_addr, TX_DT:tx_dt, TX_TM:tx_tm};
            let rtn = await this.doInsertOrUpdateCommon("TR_HOUR", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
    }


    //플러그 상태변경이력
    async insertOrUpdateTrSwEvnt ( ste_id, gtw_id, zb_addr, tx_dt, tx_tm,  vals )
    {
        try {
            let where = { STE_ID:ste_id, GTW_ID:gtw_id, ZB_ADDR:zb_addr, TX_DT:tx_dt, TX_TM:tx_tm};
            let rtn = await this.doInsertOrUpdateCommon("TR_SW_EVNT", vals, where);
            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
     }


    //플러그 제어 이력
    async inserinsertOrUpdateTrCtrl ( ste_id, gtw_id, ctl_sq,  vals )
    {
        try {

            let where = { STE_ID:ste_id, GTW_ID:gtw_id, CTL_SQ:ctl_sq};
            let rtn = await this.doInsertOrUpdateCommon("TR_CTRL", vals, where);

            return rtn;
        }catch(err){
            console.error(  err );
            throw err;
        }
     }














    //////////////////////////////////////////// COMMON METHOD ////////////////////////////////////////////
    //////////////////////////////////////////// COMMON METHOD ////////////////////////////////////////////
    //////////////////////////////////////////// COMMON METHOD ////////////////////////////////////////////

    checkMariaDBReserveWord( val ){
        val = (val + "").trim().toLocaleUpperCase();
        val = val.replace(/ /gi, "");

        if ( val == "NOW()" || val == "NULL")        //예약어 NOW()
            return  true;
        else
            return false ;
    }

    getSqlValue( val ){
        if( this.checkMariaDBReserveWord ( val ))    //예약어
            return val ;
        else
            return `'${val}'`;
    }

     //Common Methods
     async doUpdateCommon( table, values, wheres) {

        let conn, res;
        try
        {
            let updateColumns = '';
            for (let colName of Object.keys(values))
            {
                if( updateColumns === '' )
                    updateColumns += `  ${colName} = ${this.getSqlValue(values[colName])} `;
                else
                    updateColumns += `, ${colName} = ${this.getSqlValue(values[colName])} `;
            }

            let whereColums = '';
            for (let colName of Object.keys(wheres))
            {
                if( whereColums === '' )
                    whereColums += ` ${colName}='${wheres[colName]}'`;
                else
                    whereColums += ` AND ${colName}='${wheres[colName]}'`;
            }

            let sql = `UPDATE ${table} SET ${updateColumns} WHERE ${whereColums}`;

            console.info( sql );

            conn = await pool.getConnection();

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){

            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }



     //Common Methods
     async doSqlCommon( sql ) {
        let conn, res;

         try{
            console.debug( sql );

            conn = await pool.getConnection();

            res = await conn.query(sql);

            return res;
        }
        catch(err){

            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


    async doUpdateCommonSql( sql ) {

        let conn, res;
        try
        {
            console.info( sql );

            conn = await pool.getConnection();

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){

            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }



     async doInsertCommon( table, obj) {

        let conn, res;
        try
        {
            let columns = '';
            for (let colName of Object.keys(obj))
            {
                if( columns === '' )
                    columns += ` ${colName}`;
                else
                    columns += `, ${colName}`;
            }

            let values = '';
            for (let key of Object.keys(obj))
            {
                if( values === '' )
                    values += `  ${this.getSqlValue(obj[key])} `;
                else
                    values += `, ${this.getSqlValue(obj[key])} `;
            }

            let sql = `INSERT INTO ${table} (${columns}) VALUES (${values}) `;

            console.info( sql );

            conn = await pool.getConnection();

            res = await conn.query(sql);

            return res.insertId;
        }
        catch(err){

            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }



    async doDeleteCommon( table, wheres) {

        let conn, res;
        try
        {
            let whereColums = '';
            for (let colName of Object.keys(wheres))
            {
                if( whereColums === '' )
                    whereColums += ` ${colName}='${wheres[colName]}'`;
                else
                    whereColums += ` AND ${colName}='${wheres[colName]}'`;
            }

            let sql = `DELETE FROM ${table} WHERE ${whereColums}`;

            console.info( sql );

            conn = await pool.getConnection();

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){

            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }




    //Common Methods
    async doInsertOrUpdateCommon( table, values, wheres) {

        let conn, res;
        try
        {
            let insertColumns = '';
            for (let colName of Object.keys(values))
            {
                if( insertColumns === '' )
                    insertColumns += ` ${colName}`;
                else
                    insertColumns += `, ${colName}`;
            }
            for (let colName of Object.keys(wheres))
            {
                if( insertColumns === '' )
                    insertColumns += ` ${colName}`;
                else
                    insertColumns += `, ${colName}`;
            }


            let insertValues = '';
            for (let key of Object.keys(values))
            {
                if( insertValues === '' )
                    insertValues += `  ${this.getSqlValue(values[key])} `;
                else
                    insertValues += `, ${this.getSqlValue(values[key])} `;
            }
            for (let key of Object.keys(wheres))
            {
                if( insertValues === '' )
                    insertValues += ` '${wheres[key]}' `;
                else
                    insertValues += `, '${wheres[key]}'`;
            }



            let updateColumns = '';
            for (let colName of Object.keys(values))
            {
                if( updateColumns === '' )
                    updateColumns += `  ${colName}= ${this.getSqlValue(values[colName])} `;
                else
                    updateColumns += `, ${colName}= ${this.getSqlValue(values[colName])} `;
            }

            let sql = ` INSERT INTO ${table} (${insertColumns}) VALUES (${insertValues}) ` +
                      ` ON DUPLICATE KEY UPDATE  ${updateColumns} ` ;

            console.info( sql );

            conn = await pool.getConnection();

            res = await conn.query(sql);

            return res.affectedRows;
        }
        catch(err){

            console.error(  err );

            throw err;
        }
        finally{
            if (conn) conn.release();
        }
    }


}


module.exports = new Database();

