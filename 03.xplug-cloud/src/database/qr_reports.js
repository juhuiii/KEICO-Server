'use strict';

const utils     = require("../utils/utils");

/**
 * Report  관련쿼리
 */
class QueryReports {

    constructor(){

        console.info( "[QueryReports] Created ");
    }

    /***********************************************************************************
     * 단일현장 시간/일간/월간 보고서
     ***********************************************************************************/

    //시간보고서 ( 지정된 단일현장 )
    selectHourReportBySite( ste_sq, fr_date, to_date ) {

        let sql = "";

        sql += ` SELECT `;
        sql += `      D.STE_SQ `;
        sql += `    , H.STE_ID `;
        sql += `    , H.TX_DT `;
        sql += `    , H.TX_TM `;
        sql += `    , SUM(H.S_AKWH) S_AKWH `;
        sql += `    , SUM(H.E_AKWH) E_AKWH `;
        sql += `    , SUM(H.E_AKWH) - SUM(S_AKWH) SKWH `;
        sql += `    , COUNT(*) DATA_CNT `;
        sql += ` FROM TR_HOUR H JOIN TB_DEVICE D ON H.DEV_SQ = D.DEV_SQ `;
        sql += ` WHERE D.STE_SQ = ${ste_sq} AND ((H.TX_DT * 100) + H.TX_TM) >= ${fr_date} AND ((H.TX_DT * 100) + H.TX_TM) <= ${to_date} `;
        sql += ` GROUP BY D.STE_SQ, H.STE_ID, H.TX_DT , H.TX_TM `;
        sql += ` ORDER BY D.STE_SQ, H.STE_ID, H.TX_DT DESC, H.TX_TM DESC `;


       return sql;
    }


    //일간보고서 ( 지정된 단일현장 )
    selectDayReportBySite( ste_sq, fr_date, to_date ) {

        let sql = "";

        sql += ` SELECT `;
        sql += `     D.STE_SQ `;
        sql += `   , H.TX_DT `;
        sql += `   , SUM(H.S_AKWH) S_AKWH `;
        sql += `   , SUM(H.E_AKWH) E_AKWH `;
        sql += `   , SUM(H.E_AKWH) - SUM(H.S_AKWH) SKWH `;
        sql += `   , SUM(H.SAVE_KW) SAVE_KW `;
        sql += `   , SUM(H.SAVE_SEC) SAVE_SEC `;
        sql += `   , COUNT(*) DATA_CNT `;
        sql += ` FROM TR_DAY H JOIN TB_DEVICE D ON H.DEV_SQ = D.DEV_SQ `;
        sql += ` WHERE D.STE_SQ = ${ste_sq} AND H.TX_DT >= ${fr_date} AND H.TX_DT <= ${to_date} `;
        sql += ` GROUP BY D.STE_SQ,  H.TX_DT `;
        sql += ` ORDER BY H.TX_DT DESC `;

       return sql;
    }

    //월간보고서 ( 지정된 단일현장 )
    selectMonthReportBySite( ste_sq, fr_month, to_month )
    {
        let sql = "";

        sql += ` SELECT `;
        sql += ` 	  D.STE_SQ `;
        sql += ` 	, D.STE_ID `;
        sql += ` 	, CAST(((H.TX_DT)/100) AS UNSIGNED ) TX_DT `;
        sql += ` 	, SUM(H.S_AKWH) S_AKWH `;
        sql += ` 	, SUM(H.E_AKWH) E_AKWH `;
        sql += ` 	, SUM(H.E_AKWH) - SUM(H.S_AKWH) SKWH `;
        sql += ` 	, SUM(H.SAVE_KW) SAVE_KW `;
        sql += ` 	, SUM(H.SAVE_SEC) SAVE_SEC `;
        sql += ` 	, COUNT(*) DATA_CNT `;
        sql += ` FROM TR_DAY H JOIN TB_DEVICE D ON H.DEV_SQ = D.DEV_SQ `;
        sql += ` WHERE D.STE_SQ = ${ste_sq} AND CAST(((H.TX_DT)/100) AS UNSIGNED) >= ${fr_month} AND CAST(((H.TX_DT)/100) AS UNSIGNED ) <= ${to_month} `;
        sql += ` GROUP BY D.STE_SQ, D.STE_ID, CAST(((H.TX_DT)/100) AS UNSIGNED) `;
        sql += ` ORDER BY CAST(((H.TX_DT)/100) AS UNSIGNED) DESC `;

       return sql;

    }




    /***********************************************************************************
     * 단일오너(그룹) 시간/일간/월간 보고서
     ***********************************************************************************/

    //시간보고서 ( 지정된 단일오너 )
    selectHourReportByOwner( own_sq, fr_date, to_date )
    {
        let sql = "";

        sql += ` SELECT `;
        sql += ` 	  S.OWN_SQ `;
        sql += `   	, H.TX_DT `;
        sql += ` 	, H.TX_TM `;
        sql += ` 	, SUM(H.S_AKWH) S_AKWH `;
        sql += ` 	, SUM(H.E_AKWH) E_AKWH `;
        sql += ` 	, SUM(H.E_AKWH) - SUM(H.S_AKWH) SKWH `;
        sql += ` 	, COUNT(*) DATA_CNT `;
        sql += ` FROM TR_HOUR H `;
        sql += ` 	LEFT JOIN TB_DEVICE D ON H.DEV_SQ = D.DEV_SQ `;
        sql += ` 	LEFT JOIN TB_SITE   S ON D.STE_SQ = S.STE_SQ `;
        sql += ` WHERE S.OWN_SQ = ${own_sq} AND ((H.TX_DT * 100) + H.TX_TM) >= ${fr_date} AND ((H.TX_DT * 100) + H.TX_TM) <= ${to_date} `;
        sql += ` GROUP BY S.OWN_SQ, H.TX_DT , H.TX_TM `;
        sql += ` ORDER BY TX_DT DESC, TX_TM DESC `;

        return sql;
    }

    //일간보고서 ( 지정된 단일오너 )
    selectDayReportByOwner( own_sq, fr_date, to_date )
    {
        let sql = "";

        sql += ` SELECT `;
        sql += `      S.OWN_SQ `;
        sql += `    , H.TX_DT `;
        sql += `    , SUM(H.S_AKWH) S_AKWH `;
        sql += `    , SUM(H.E_AKWH) E_AKWH `;
        sql += `    , SUM(H.E_AKWH) - SUM(H.S_AKWH) SKWH `;
        sql += `    , SUM(H.SAVE_KW) SAVE_KW `;
        sql += `    , SUM(H.SAVE_SEC) SAVE_SEC `;
        sql += `    , COUNT(*) DATA_CNT `;
        sql += ` FROM TR_DAY H  `;
        sql += ` 	LEFT JOIN TB_DEVICE D ON H.DEV_SQ = D.DEV_SQ `;
        sql += ` 	LEFT JOIN TB_SITE   S ON D.STE_SQ = S.STE_SQ `;
        sql += ` WHERE S.OWN_SQ = ${own_sq} AND H.TX_DT >= ${fr_date} AND H.TX_DT <= ${to_date}  `;
        sql += ` GROUP BY S.OWN_SQ, H.TX_DT  `;
        sql += ` ORDER BY TX_DT DESC `;

        return sql;
    }

    //월간보고서 ( 지정된 단일오너 )
    selectMonthReportByOwner( own_sq, fr_month, to_month )
    {
        let sql = "";

        sql += ` SELECT `;
        sql += `   S.OWN_SQ `;
        sql += `   , CAST(((H.TX_DT)/100) AS UNSIGNED ) TX_DT `;
        sql += `   , SUM(H.S_AKWH) S_AKWH `;
        sql += `   , SUM(H.E_AKWH) E_AKWH `;
        sql += `   , SUM(H.E_AKWH) - SUM(S_AKWH) SKWH `;
        sql += `   , SUM(H.SAVE_KW) SAVE_KW `;
        sql += `   , SUM(H.SAVE_SEC) SAVE_SEC `;
        sql += `   , COUNT(*) DATA_CNT `;
        sql += ` FROM TR_DAY H `;
        sql += ` 	LEFT JOIN TB_DEVICE D ON H.DEV_SQ = D.DEV_SQ `;
        sql += ` 	LEFT JOIN TB_SITE   S ON D.STE_SQ = S.STE_SQ `;
        sql += ` WHERE S.OWN_SQ  = ${own_sq} AND CAST(((H.TX_DT)/100) AS UNSIGNED) >= ${fr_month} AND CAST(((H.TX_DT)/100) AS UNSIGNED ) <= ${to_month} `;
        sql += ` GROUP BY S.OWN_SQ, CAST(((TX_DT)/100) AS UNSIGNED) `;
        sql += ` ORDER BY CAST(((TX_DT)/100) AS UNSIGNED) DESC `;

        return sql;
    }




    /***********************************************************************************
     * 제어이력
     ***********************************************************************************/

     //제어이력 ( 조건 : 오너, 현장, 게이트웨이, 플러그, 제어일자  )
     selectControlReport( own_sq, ste_sq, gtw_sq, dev_sq, fr_date, to_date )
     {

        let sql = "";

        sql += ` SELECT `;
        sql += ` 	  S.OWN_SQ `;
        sql += ` 	, S.STE_NM `;
        sql += ` 	, S.STE_SQ `;
        sql += ` 	, C.STE_ID `;
        sql += ` 	, C.GTW_SQ `;
        sql += ` 	, C.GTW_ID `;
        sql += ` 	, C.CTL_SQ `;
        sql += ` 	, C.CTL_DT `;
        sql += ` 	, C.CTL_TM `;
        sql += ` 	, C.ZB_ADDR `;
        sql += ` 	, D.DEV_NM `;
        sql += ` 	, C.GRP_SQ `;
        sql += ` 	, PG.GRP_NM `;
        sql += ` 	, C.CTL_TYPE `;
        sql += ` 	, CASE WHEN C.CTL_TYPE = 1  THEN '수동제어' `;
        sql += ` 	    WHEN C.CTL_TYPE = 11    THEN '수동제어-모바일' `;
        sql += ` 	    WHEN C.CTL_TYPE = 2     THEN '스케쥴제어' `;
        sql += ` 	    WHEN C.CTL_TYPE = 22    THEN '스케쥴제어-모바일' `;
        sql += ` 	    ELSE '-' END CTL_TYPE_NM `;
        sql += ` 	, C.CTL_OBJ `;
        sql += ` 	, CASE WHEN C.CTL_OBJ = 1   THEN '개별제어' `;
        sql += ` 	    WHEN C.CTL_OBJ = 2      THEN '그룹제어' `;
        sql += ` 	    WHEN C.CTL_OBJ = 3      THEN '전체제어' `;
        sql += ` 	    ELSE '-' END CTL_OBJ_NM `;
        sql += ` 	, C.CTL_CMD `;
        sql += ` 	, CASE WHEN C.CTL_CMD = 0   THEN 'OFF' `;
        sql += ` 	    WHEN C.CTL_CMD = 1      THEN 'ON' `;
        sql += ` 	    ELSE '-' END CTL_CMD_NM `;
        sql += ` 	, C.SCHD_TM_SQ `;
        sql += ` 	, C.KW `;
        sql += ` FROM TR_CTRL C `;
        sql += ` 	LEFT JOIN TB_GATEWAY  G  ON C.GTW_SQ = G.GTW_SQ `;
        sql += ` 	LEFT JOIN TB_SITE     S  ON G.STE_SQ = S.STE_SQ `;
        sql += `    LEFT JOIN TB_OWNER    O  ON S.OWN_SQ = O.OWN_SQ `;
        sql += `    LEFT JOIN TB_DEVICE   D  ON C.GTW_SQ = D.GTW_SQ  AND C.ZB_ADDR = D.DEV_ID `;
        sql += `    LEFT JOIN TM_GROUP    PG ON C.GTW_SQ = PG.GTW_SQ AND C.GRP_SQ  = PG.GRP_SQ `;
        sql += ` WHERE  C.CTL_DT >= ${fr_date} AND C.CTL_DT <= ${to_date} `;

        if( own_sq )  sql += ` AND S.OWN_SQ  = ${own_sq} `;
        if( ste_sq )  sql += ` AND S.STE_SQ  = ${ste_sq} `;
        if( gtw_sq )  sql += ` AND C.GTW_SQ  = ${gtw_sq} `;
        if( dev_sq )  sql += ` AND D.DEV_SQ  = ${dev_sq} `;

        sql += ` ORDER BY C.CTL_DT DESC, C.CTL_TM DESC `;

        return sql;
    }


    /***********************************************************************************
     * 플러그 동작이력
     ***********************************************************************************/
    //동작이력  (조건 : 오너, 현장, 게이트웨이, 플러그, 동작일자  )
    selectSwEvntReport( own_sq, ste_sq, gtw_sq, dev_sq, fr_date, to_date )
    {
        let sql = "";

        sql += ` SELECT `;
        sql += `	  S.OWN_SQ `;
        sql += ` 	, S.STE_SQ `;
        sql += `    , S.STE_ID `;
        sql += `    , S.STE_NM `;
        sql += `    , D.GTW_SQ `;
        sql += `    , E.GTW_ID `;
        sql += `    , E.ZB_ADDR `;
        sql += `    , D.DEV_NM `;
        sql += `    , E.TX_DT `;
        sql += `    , E.TX_TM `;
        sql += `    , E.SW_ST `;
        sql += `    , CASE 	WHEN E.SW_ST = 0  THEN 'OFF' `;
        sql += `    		WHEN E.SW_ST = 1  THEN 'ON' `;
        sql += ` 	  ELSE '-' END SW_ST_NM `;
        sql += `    , E.SAVE_KW `;
        sql += `    , E.SAVE_SEC `;
        sql += ` FROM TR_SW_EVNT E `;
        sql += ` 	LEFT JOIN TB_DEVICE D ON  E.DEV_SQ = D.DEV_SQ `;
        sql += ` 	LEFT JOIN TB_SITE   S ON  D.STE_SQ = S.STE_SQ `;
        sql += `     LEFT JOIN TB_OWNER O ON  S.OWN_SQ = O.OWN_SQ `;
        sql += ` WHERE E.TX_DT >= ${fr_date} AND E.TX_DT <= ${to_date} `;

        if( own_sq )  sql += ` AND S.OWN_SQ = '${own_sq}' `;
        if( ste_sq )  sql += ` AND S.STE_SQ = '${ste_sq}' `;
        if( gtw_sq )  sql += ` AND E.GTW_SQ = '${gtw_sq}' `;
        if( dev_sq )  sql += ` AND E.DEV_SQ = '${dev_sq}' `;

        sql += ` ORDER BY E.TX_DT DESC, E.TX_TM DESC `;

        return sql;
    }

}

module.exports = new QueryReports();