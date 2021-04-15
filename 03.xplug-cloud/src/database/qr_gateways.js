'use strict';

const utils     = require("../utils/utils");

/**
 * TB_OWER 관련쿼리
 */
class QueryGateways {

    constructor(){

        console.info( "[QuerySites] Created ");
    }


    //자손 또는 자식 현장목록
    selectGateways( own_sq = null, ste_sq = null, gtw_sq = null) {

        let sql = "";

        sql += ` SELECT `;
        sql += `   G.GTW_SQ, `;
        sql += `   G.STE_ID, `;
        sql += `   G.GTW_ID, `;
        sql += `   G.GTW_NM, `;
        sql += `   G.HW_MDL_CD, `;
        sql += `   G.SW_MDL_CD, `;
        sql += `   G.BIGO, `;
        sql += `   G.RCV_DT, `;
        sql += `   G.STAT, `;
        sql += `   CASE WHEN G.STAT = 1 THEN '정상' ELSE '해제' END STAT_NM, `;
        sql += `   DATE_FORMAT( G.EDT_DT, '%Y-%m-%d %H:%i:%s' ) EDT_DT, `;
        sql += `   DATE_FORMAT( G.REG_DT, '%Y-%m-%d %H:%i:%s' ) REG_DT, `;
        sql += `   S.STE_SQ, `;
        sql += `   S.STE_NM, `;
        sql += `   O.OWN_SQ, `;
        sql += `   O.OWN_NM `;
        sql += ` FROM TB_GATEWAY G `;
        sql += `   LEFT JOIN TB_SITE  S ON G.STE_SQ = S.STE_SQ `;
        sql += `   LEFT JOIN TB_OWNER O ON S.OWN_SQ = O.OWN_SQ `;
        sql += ` WHERE G.STAT = 1` ;

        if( utils.isNotEmpty( own_sq  ) ) sql += ` AND O.OWN_SQ = ${own_sq}`;
        if( utils.isNotEmpty( ste_sq  ) ) sql += ` AND S.STE_SQ = ${own_sq}`;
        if( utils.isNotEmpty( gtw_sq  ) ) sql += ` AND G.GTW_SQ = ${gtw_sq}`;


        sql += ` ORDER BY G.GTW_NM `;

       return sql;
    }
}


module.exports = new QueryGateways();
