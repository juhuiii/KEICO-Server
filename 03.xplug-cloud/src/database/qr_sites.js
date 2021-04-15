'use strict';

const utils     = require("../utils/utils");

/**
 * TB_OWER 관련쿼리
 */
class QuerySites {

    constructor(){

        console.info( "[QuerySites] Created ");
    }


    //자손 또는 자식 현장목록
    selectSitesWithMeas( own_sq, ste_sq = null, withOffstring = false ) {

        let sql = "";

        sql += ` SELECT  `;
        sql += ` S.STE_SQ  `;
        sql += ` , S.OWN_SQ `;
        sql += ` , S.STE_ID `;
        sql += ` , S.STE_NM `;
        sql += ` , DATE_FORMAT( S.INS_DT, '%Y-%m-%d %H:%i:%s' ) INS_DT `;
        sql += ` , S.TEL_NO `;
        sql += ` , S.ADDR `;
        sql += ` , S.BIGO `;
        sql += ` , COUNT(*) PLUG_CNT `;
        sql += ` , COUNT( IF(M.SW_ST   = 1, 1, NULL)) ON_CNT `;
        sql += ` , COUNT( IF(M.SW_ST  != 1, 1, NULL)) OFF_CNT `;
        sql += ` , COUNT( IF(D.COM_ST != 1, 1, NULL)) COM_ERR_CNT `;
        sql += ` , SUM(M.KW) KW `;
        sql += ` , MAX(M.DATA_DT) DATA_DT `;
        sql += ` , IF( ABS(TIMESTAMPDIFF(SECOND, MAX(M.DATA_DT), NOW())) < 1800, 1,  0) COM_ST `;
        sql += ` FROM TB_SITE S `;
        sql += `    JOIN TB_DEVICE D ON S.STE_SQ = D.STE_SQ `;
        sql += `    JOIN TM_PLUG   M ON D.DEV_SQ = M.DEV_SQ `;
        sql += ` WHERE S.STAT =1 AND D.STAT = 1 `;
        if( withOffstring == false ) {
            sql += ` AND S.OWN_SQ = ${own_sq} `;
        }else{
            //todo : 자손그룹의 현장 포함하기
            // sql += ` AND S.OWN_SQ IN  ( SELECT ${own_sq} ) `;
        }

        if( ste_sq != null  ) {
            sql += ` AND S.STE_SQ = ${ste_sq} `;
        }
        sql += ` GROUP BY S.STE_SQ `;
        sql += ` ORDER BY S.STE_NM `;

       return sql;
    }


    //현장목록
    selectSites( own_sq = null, ste_sq = null){

        let sql = "";

        sql += ` SELECT  `;
        sql += `   OWN_SQ `;
        sql += ` , STE_SQ `;
        sql += ` , STE_ID `;
        sql += ` , STE_NM `;
        sql += ` , DATE_FORMAT( INS_DT, '%Y-%m-%d' ) INS_DT `;
        sql += ` , TEL_NO `;
        sql += ` , ADDR `;
        sql += ` , BIGO `;
        sql += ` , STAT `;
        sql += ` , CASE WHEN STAT = 1 THEN '정상' ELSE '해제' END STAT_NM `;
        sql += ` , DATE_FORMAT( EDT_DT, '%Y-%m-%d %H:%i:%s' ) EDT_DT `;
        sql += ` , DATE_FORMAT( REG_DT, '%Y-%m-%d %H:%i:%s' ) REG_DT `;
        sql += ` FROM TB_SITE `;
        sql += ` WHERE STAT = 1`;

        if( utils.isNotEmpty( ste_sq  ) ) sql += ` AND STE_SQ  =  ${ste_sq}`
        if( utils.isNotEmpty( own_sq  ) ) sql += ` AND OWN_SQ  =  ${own_sq}`

        return sql;
    }

    // //현장정보 수정
    // updateSite( data ){

    //     let sql = "";

    //     sql += ` UPDATE TB_SITE SET `;
    //     sql += `   OWN_SQ = ${data['OWN_SQ']}`;
    //     sql += ` , STE_ID = '${data['STE_ID']}'`;
    //     sql += ` , STE_NM = '${data['STE_NM']}'`;
    //     //sql += ` , DATE_FORMAT( INS_DT, '%Y-%m-%d' ) INS_DT `;
    //     sql += ` , INS_DT = ${data['INS_DT']}`;
    //     sql += ` , TEL_NO = '${data['TEL_NO']}'`;
    //     sql += ` , ADDR   = '${data['ADDR']}'`;
    //     sql += ` , BIGO   = '${data['BIGO']}'`;
    //     sql += ` , EDT_DT = NOW() `;
    //     sql += ` FROM TB_SITE `;
    //     sql += ` WHERE STE_SQ = ${data['STE_SQ']}`;

    //     return sql ;
    // }

    // //현장정보 삭제
    // deleteSite( ste_sq ){

    //     let sql = "";

    //     sql += ` UPDATE  TB_SITE SET `;
    //     sql += `   STAT = 0 `;
    //     sql += ` , EDT_DT = NOW() `;
    //     sql += ` FROM TB_SITE `;
    //     sql += ` WHERE STE_SQ = ${ste_sq}`;

    // }

    // //현장정보 등록
    // insertSite( data ){

    //     let sql = "";

    //     sql += ` INSERT INTO TB_SITE () `;
    //     sql += `   OWN_SQ `;
    //     sql += ` , STE_ID `;
    //     sql += ` , STE_NM `;
    //     sql += ` , INS_DT `;
    //     sql += ` , TEL_NO `;
    //     sql += ` , ADDR   `;
    //     sql += ` , BIGO   `;
    //     sql += ` , EDT_DT  `;
    //     sql += ` , REG_DT `;
    //     sql += `) VALUES ( `
    //     sql += `   ${data['OWN_SQ']}`;
    //     sql += ` , '${data['STE_ID']}'`;
    //     sql += ` , '${data['STE_NM']}'`;
    //     sql += ` ,  ${data['INS_DT']}`;
    //     sql += ` , '${data['TEL_NO']}'`;
    //     sql += ` , '${data['ADDR']}'`;
    //     sql += ` , '${data['BIGO']}'`;
    //     sql += ` , EDT_DT = NOW() `;
    //     sql += ` , REG_DT = NOW() `;
    //     sql += `) `;

    //     return sql ;

    // }





}


module.exports = new QuerySites();
