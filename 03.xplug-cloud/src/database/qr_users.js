'use strict';

/**
 * TB_USER 관련쿼리
 */
class QueryUsers {

    constructor(){

        console.info( "[QueryUsers] Created ");
    }



     //사용자 조회 (그룹시용자 또는 현장사용자 )
     selectUser( user_id, usr_gb = 1 ){

        let sql =  "";
        sql += ` SELECT `;
        sql += `   U.USR_SQ `;
        sql += ` , U.USR_ID `;
        sql += ` , U.PWD `;
        sql += ` , U.USR_GB `;
        sql += ` , U.USR_NM `;
        sql += ` , DATE_FORMAT(U.ACCT_DT, '%Y-%m-%d %H:%i:%s') ACCT_DT `;
        sql += ` , S.STE_NM `;
        sql += ` , U.STE_SQ `;
        sql += ` , S.STE_ID `;
        sql += ` , U.OWN_SQ `;
        sql += ` , G.OWN_NM `;
        sql += ` FROM TB_USER U `;
        sql += `    LEFT JOIN TB_SITE   S ON  U.STE_SQ = S.STE_SQ `;
        sql += `    LEFT JOIN TB_OWNER  G ON  U.OWN_SQ = G.OWN_SQ `;
        sql += ` WHERE U.STAT = 1 AND U.USR_ID = '${user_id}' AND U.USR_GB = ${usr_gb}`;

        return sql;
    }


    selectUserByUsrSq( usr_sq ){

        let sql =  "";
        sql += ` SELECT `;
        sql += `   U.USR_SQ `;
        sql += ` , U.USR_ID `;
        sql += ` , U.PWD `;
        sql += ` , U.USR_NM `;
        sql += ` , U.USR_GB `;
        sql += ` , CASE WHEN U.USR_GB = 1 THEN '현장사용자' ELSE '그룹관리자' END USR_GB_NM `;
        sql += ` , U.OWN_SQ `;
        sql += ` , U.STE_SQ `;
        sql += ` , U.STE_ID `;
        sql += ` , DATE_FORMAT(U.ACCT_DT, '%Y-%m-%d %H:%i:%s') ACCT_DT `;
        sql += ` , U.STAT  `;
        sql += ` , CASE WHEN U.STAT = 1 THEN '정상' ELSE '해제' END STAT_NM `;
        sql += ` , DATE_FORMAT( U.EDT_DT, '%Y-%m-%d %H:%i:%s' ) EDT_DT `;
        sql += ` , DATE_FORMAT( U.REG_DT, '%Y-%m-%d %H:%i:%s' ) REG_DT  `;
        sql += ` FROM TB_USER U `;
        sql += ` WHERE U.STAT = 1 AND U.USR_SQ = ${usr_sq} `;

        return sql;
    }


    //그룹시용자 조회
    selectUserByOwner( own_sq ){

        let sql =  "";
        sql += ` SELECT `;
        sql += `   U.USR_SQ `;
        sql += ` , U.USR_ID `;
        sql += ` , U.PWD `;
        sql += ` , U.USR_GB `;
        sql += ` , U.USR_NM `;
        sql += ` , DATE_FORMAT(U.ACCT_DT, '%Y-%m-%d %H:%i:%s') ACCT_DT `;
        sql += ` , S.STE_NM `;
        sql += ` , U.STE_SQ `;
        sql += ` , S.STE_ID `;
        sql += ` , U.OWN_SQ `;
        sql += ` , G.OWN_NM `;
        sql += ` FROM TB_USER U `;
        sql += `    LEFT JOIN TB_SITE   S ON  U.STE_SQ = S.STE_SQ `;
        sql += `    LEFT JOIN TB_OWNER  G ON  U.OWN_SQ = G.OWN_SQ `;
        sql += ` WHERE U.STAT = 1 AND U.OWN_SQ = '${own_sq}' `;

        return sql;
    }


     //지정된 오너의 자식 현장시용자 조회
     selectSiteUserByOwner( own_sq ){

        let sql =  "";
        // sql += ` SELECT `;
        // sql += `   U.USR_SQ `;
        // sql += ` , U.USR_ID `;
        // sql += ` , U.PWD `;
        // sql += ` , U.USR_GB `;
        // sql += ` , U.USR_NM `;
        // sql += ` , DATE_FORMAT(U.ACCT_DT, '%Y-%m-%d %H:%i:%s') ACCT_DT `;
        // sql += ` , S.STE_NM `;
        // sql += ` , U.STE_SQ `;
        // sql += ` , S.STE_ID `;
        // sql += ` , U.OWN_SQ `;
        // sql += ` , G.OWN_NM `;
        // sql += ` FROM TB_USER U `;
        // sql += `    LEFT JOIN TB_SITE   S ON  U.STE_SQ = S.STE_SQ `;
        // sql += `    LEFT JOIN TB_OWNER  G ON  U.OWN_SQ = G.OWN_SQ `;
        // sql += ` WHERE U.STAT = 1 AND U.OWN_SQ = '${own_sq}' `;

        sql += ` SELECT `;
        sql += `   U.USR_SQ  `;
        sql += ` , U.USR_ID  `;
        sql += ` , U.PWD  `;
        sql += ` , U.USR_NM  `;
        sql += ` , U.USR_GB  `;
        sql += ` , CASE WHEN U.USR_GB = 1 THEN '현장사용자' ELSE '그룹관리자' END USR_GB_NM `;
        sql += ` , U.OWN_SQ   `;
        sql += ` , U.STE_SQ  `;
        sql += ` , U.STE_ID    `;
        sql += ` , S.STE_NM   `;
        sql += ` , DATE_FORMAT( ACCT_DT, '%Y-%m-%d %H:%i:%s' ) ACCT_DT `;
        sql += ` , U.STAT  `;
        sql += ` , CASE WHEN U.STAT = 1 THEN '정상' ELSE '해제' END STAT_NM `;
        sql += ` , DATE_FORMAT( U.EDT_DT, '%Y-%m-%d %H:%i:%s' ) EDT_DT `;
        sql += ` , DATE_FORMAT( U.REG_DT, '%Y-%m-%d %H:%i:%s' ) REG_DT  `;
        sql += ` FROM TB_USER U  `;
        sql += `    LEFT JOIN TB_SITE S ON U.STE_SQ = S.STE_SQ `;
        sql += ` WHERE U.STAT = 1 AND U.USR_GB = 1 ` ;
        sql += `    AND S.OWN_SQ = ${own_sq}  `;

        return sql;

    }

}

module.exports = new QueryUsers();