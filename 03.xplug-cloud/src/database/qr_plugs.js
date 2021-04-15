'use strict';

const utils     = require("../utils/utils");

/**
 * TB_USER 관련쿼리
 */
class QueryPlugs {

    constructor(){

        console.info( "[QueryPlugs] Created !!");
    }



     //그룹내 또는 현장내 플러그 목롲 조회
     selectPlugsByOwner( own_sq , ste_sq = null){

        let sql = ` SELECT `;
        sql += ` S.STE_SQ, `;
        sql += ` S.STE_ID, `;
        sql += ` S.STE_NM, `;
        sql += ` S.OWN_SQ, `;
        sql += ` D.GTW_SQ, `;
        sql += ` D.GTW_ID, `;
        sql += ` D.DEV_SQ, `;
        sql += ` D.DEV_ID, `;
        sql += ` D.DEV_NM, `;
        sql += ` D.KND_CD, `;
        sql += ` D.MDL_CD, `;
        sql += ` DATE_FORMAT( STR_TO_DATE((D.RCV_DT * 1000000) + D.RCV_TM, '%Y%m%d%H%i%s'), '%Y-%m-%d %H:%i:%s' ) DATA_DT, `;
        sql += ` IF( ABS(TIMESTAMPDIFF(SECOND, STR_TO_DATE((D.RCV_DT * 1000000) + D.RCV_TM, '%Y%m%d%H%i%s'), NOW())) < 5400, 1, 2) COM_ST, `;
        // sql += ` DATE_FORMAT( M.DATA_DT, '%Y-%m-%d %H:%i:%s' ) DATA_DT, `;
        // sql += ` IF( ABS(TIMESTAMPDIFF(SECOND, M.DATA_DT, NOW())) < 5400, 1,  2) COM_ST, `;    // 플러그 통신이상 클라우드에서 자체처리 ==> M.DATA_DT컬럼은 D.EDT_DT로 대체 가능함..
        // sql += ` D.COM_ST, `;
        sql += ` D.STAT, `;
        sql += ` M.SW_ST, `;
        sql += ` M.KW, `;
        sql += ` M.AKWH, `;
        sql += ` M.STBY_KW, `;
        sql += ` M.OFF_DELY, `;
        sql += ` M.MANU_CTL_ALLOW, `;
        sql += ` M.GRP_SQ, `;
        sql += ` M.ZB_RGRP_RID, `;
        sql += ` M.ZB_ONGRP_RID, `;
        sql += ` M.ZB_OFFGRP_RID, `;
        sql += ` M.ZB_RGRP_AID, `;
        sql += ` M.ZB_ONGRP_AID, `;
        sql += ` M.ZB_OFFGRP_AID `;
        sql += ` FROM TB_SITE S `;
        sql += ` JOIN TB_DEVICE D ON D.STE_SQ = S.STE_SQ `;
        sql += ` JOIN TM_PLUG M   ON D.DEV_SQ = M.DEV_SQ `;
        sql += ` WHERE D.STAT = 1 AND S.STAT = 1 AND S.OWN_SQ = ${own_sq}`;

        if( utils.isNotEmpty( ste_sq  ) )  sql += ` AND S.STE_SQ = '${ste_sq}'`

        sql += ` ORDER BY S.OWN_SQ, S.STE_NM, D.DEV_NM `;
        return sql;

    }

}

module.exports = new QueryPlugs();