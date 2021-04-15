'use strict';

const utils     = require("../utils/utils");
/**
 * TB_OWER 관련쿼리
 */
class QueryOwners {

    constructor(){

        console.info( "[QueryOwners] Created " );
    }


    //후손 Owners
    selectOnwersOffspring( own_sq, with_me = false ) {
        let sql = "";
        sql += ` SELECT OWN_SQ, OWN_NM, PAR_SQ, STAT `;
        sql += ` FROM ( `;
        sql += `    SELECT TOWN.* FROM ( `;
        sql += `        SELECT F_TB_OWNER_CONNECT_BY_CHILDS(OWN_SQ) AS OWN_SQ `;
        sql += `        FROM ( `;
        sql += `            SELECT `;
        sql += `                @start_with := ${own_sq} `;
        sql += `              , @own_sq := @start_with `;
        sql += `              , @level  := 0 `;
        sql += `        ) VARS, TB_OWNER `;
        sql += `        WHERE  @own_sq IS NOT NULL `;
        sql += `    ) TVAR JOIN TB_OWNER TOWN ON TVAR.OWN_SQ = TOWN.OWN_SQ    `;
        sql += `    UNION `;
        sql += `    SELECT * FROM TB_OWNER WHERE OWN_SQ = ${own_sq} `;
        sql += `) O `;
        sql += `WHERE STAT = 1 `;

       //자기자신 포함여부
       if( with_me == false )  sql += ` AND OWN_SQ != ${own_sq} `;

       return sql;
    }


    //자식 Owners (바로자식만)
    selectOnwersChild( own_sq, with_me = false )
    {
        let sql = "";
        sql += ` SELECT OWN_SQ, OWN_NM, PAR_SQ, STAT ` ;
        sql += ` FROM TB_OWNER ` ;
        sql += ` WHERE STAT = 1 AND PAR_SQ  =  ${own_sq} `;

        if( with_me == true )  //자기자신 포함
        {
            sql +=  ` UNION ALL `;
            sql +=  ` SELECT OWN_SQ, OWN_NM, PAR_SQ, STAT  `;
            sql +=  ` FROM TB_OWNER `;
            sql +=  ` WHERE STAT = 1 AND OWN_SQ  =  ${own_sq}`;
        }

        return sql ;
    }

    //부모 Onwers
    selectOnwersParent( own_sq, with_me = true  )
    {
        let sql = "";

        sql +=  `   SELECT OWN_SQ, OWN_NM, PAR_SQ, STAT  `;
        sql +=  `   FROM ( `;
        sql += `        SELECT TOWN.*  `;
        sql += `        FROM ( `;
        sql += `            SELECT `;
        sql += `                F_TB_OWNER_CONNECT_BY_PARENTS() AS OWN_SQ `;
        sql += `            FROM ( `;
        sql += `                SELECT `;
        sql += `                @own_sq := ${own_sq} `;
        sql += `                , @level := 0 `;
        sql += `            ) VARS, TB_OWNER `;
        sql += `            WHERE @own_sq IS NOT NULL `;
        sql += `        ) TVAR JOIN TB_OWNER TOWN ON TVAR.OWN_SQ = TOWN.OWN_SQ `;
        sql += `        UNION `;
        sql += `        SELECT * FROM TB_OWNER WHERE OWN_SQ = ${own_sq} `;
        sql += `    ) OWN `;
        sql += `WHERE STAT = 1`;

        //자기자신 포함하지 여부
        if( with_me == false )  sql +=  ` AND OWN_SQ != ${own_sq} `;

        return sql;
    }


    selectOnwers( own_sq ){
        let sql = "";
        sql +=  ` SELECT OWN_SQ, OWN_NM, PAR_SQ, STAT  `;
        sql +=  ` FROM TB_OWNER `;
        sql +=  ` WHERE STAT = 1 `;
        if( own_sq != null ) sql +=  ` AND OWN_SQ  =  ${own_sq}`;

        return sql;

    }
}


module.exports = new QueryOwners();
