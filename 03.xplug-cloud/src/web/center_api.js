const express       = require('express');
const db            = require('../database');
const logger        = require('../utils/logger');

const xgUtils       = require("../utils/utils");
let router          = express.Router();

let DEBUG = true;

///////////////////////////////////////// Center Group 사용자용  ////////////////////////////////////////
///////////////////////////////////////// Center Group 사용자용  ////////////////////////////////////////
///////////////////////////////////////// Center Group 사용자용  ////////////////////////////////////////

///////////////////////////////////////////////////////////////////
// 센터 로그인
///////////////////////////////////////////////////////////////////

//로그인  ( OK 2020-06 )
router.get('/login', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let uid = req.query.uid || '';
    let pwd = req.query.pwd || '';

    try
    {
        let rows = await db.selectUser(uid, 2); //그룹사용자 조회

        if( rows.length <= 0 ){
            ResponseStat ( res, "1", "아이디를 확인 하세요" );
            return ;
        }
        if( rows[0]['PWD'] !=  pwd ) {
            ResponseStat ( res, "1", "비밀번호를  확인 하세요" );
            return ;
        }
        ResponseData( res, rows , true);
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



///////////////////////////////////////////////////////////////////
// 사용정 정보
///////////////////////////////////////////////////////////////////

//그룹내 자식 현장사용자 목록 ( OK 2020-07 )
router.get('/owners/:own_sq/site_users', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    try
    {
        let rows = await db.selectSiteUserByOwner(own_sq);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//사용자 상세정보
router.get('/users/:usr_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let usr_sq = req.params.usr_sq || '';

    try
    {
        let rows = await db.selectUserByUsrSq ( usr_sq );
        ResponseData( res, rows );        //현장정보
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//사용자 수정
router.post('/users/:usr_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let usr_sq = req.params.usr_sq || '';
    let vals = {
        USR_ID : req.body['USR_ID'],
        PWD    : req.body['PWD']   ,
        USR_NM : req.body['USR_NM'],
        USR_GB : req.body['USR_GB'],
        OWN_SQ : req.body['OWN_SQ'],
        STE_SQ : req.body['STE_SQ'],
        STE_ID : req.body['STE_ID'],
    }

    try
    {
        await db.updateUserBySq(usr_sq, vals) ;
        ResponseStat(res, "0", "수정성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//사용자 삭제
router.delete('/users/:usr_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let usr_sq = req.params.usr_sq || '';
    try
    {
        await db.deleteUser( usr_sq )
        ResponseStat(res, "0", "삭제성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//사용자 등록
router.post('/users', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let vals = {
        USR_ID : req.body['USR_ID'],
        PWD    : req.body['PWD']   ,
        USR_NM : req.body['USR_NM'],
        USR_GB : req.body['USR_GB'],
        OWN_SQ : req.body['OWN_SQ'],
        STE_SQ : req.body['STE_SQ'],
        STE_ID : req.body['STE_ID'],
    }

    try
    {
        let usr_sq = await db.insertUser(vals) ;
        let data = { USR_SQ : usr_sq} ;
        ResponseData( res, data );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});




///////////////////////////////////////////////////////////////////
// 플러그 정보
///////////////////////////////////////////////////////////////////

//그룹내 플러그 목록 ( OK 2020-06 )
router.get('/owners/:own_sq/plugs', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    try
    {
        let rows = await db.selectPlugsByOwner(own_sq);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//현장내 플러그 목록 ( OK 2020-06 )
router.get('/owners/:own_sq/sites/:ste_sq/plugs', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq  = req.params.own_sq || '';
    let ste_sq  = req.params.ste_sq  || '';

    try
    {
        let rows = await db.selectPlugsByOwner(own_sq, ste_sq);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



///////////////////////////////////////////////////////////////////
// 오너 정보
///////////////////////////////////////////////////////////////////

//오너 목록  ( OK 2020-06 )
router.get('/owners', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    try
    {
        let rows = await db.selectOwners();

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//오너 상세 정보  ( OK 2020-06 )
router.get('/owners/:own_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    try
    {
        let rows = await db.selectOwners(own_sq);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});






///////////////////////////////////////////////////////////////////
// 현장 정보
///////////////////////////////////////////////////////////////////


//현장정보 (그룹내 현장 목록) ( OK 2020-06 )
router.get('/owners/:own_sq/sites', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    try
    {
        let rows = await db.selectSites( own_sq );
        ResponseData( res, rows );        //그룹내 현장목록
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//현장별 계측정보 ( OK 2020-06 )
router.get('/owners/:own_sq/sites/meas', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    try
    {
        let rows = await db.selectSiteMeas( own_sq , null);

        ResponseData( res, rows );        //그룹내 현장목록
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//현장상세정보
router.get('/sites/:ste_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    try
    {
        let rows = await db.selectSites( null, ste_sq );
        ResponseData( res, rows );        //현장정보
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//현장정보 수정
router.post('/sites/:ste_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';
    let vals = {
        OWN_SQ : req.body['OWN_SQ'],
        STE_ID : req.body['STE_ID'],
        STE_NM : req.body['STE_NM'],
        INS_DT : req.body['INS_DT'],
        TEL_NO : req.body['TEL_NO'],
        ADDR   : req.body['ADDR'],
        BIGO   : req.body['BIGO'],
    }


    try
    {
        await db.updateSite(ste_sq, vals) ;
        ResponseStat(res, "0", "수정성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//현장정보 삭제
router.delete('/sites/:ste_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    try
    {
        await db.deleteSite( ste_sq )
        ResponseStat(res, "0", "삭제성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//현장정보 등록
router.post('/sites', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let vals = {
        OWN_SQ : req.body['OWN_SQ'],
        STE_ID : req.body['STE_ID'],
        STE_NM : req.body['STE_NM'],
        INS_DT : req.body['INS_DT'],
        TEL_NO : req.body['TEL_NO'],
        ADDR   : req.body['ADDR'],
        BIGO   : req.body['BIGO'],
    }


    try
    {
        let ste_sq = await db.insertSite(vals) ;
        let data = { STE_SQ : ste_sq} ;
        ResponseData( res, data );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


///////////////////////////////////////////////////////////////////
// 게이트웨이 정보
///////////////////////////////////////////////////////////////////

//그룹내 게이트웨이 목록 ( OK 2020-07 )
router.get('/owners/:own_sq/gateways', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    try
    {
        let rows = await db.selectGatewaysBySiteOwner(own_sq);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//게이트웨이 상세정보
router.get('/gateways/:gtw_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let gtw_sq = req.params.gtw_sq || '';

    try
    {
        let rows = await db.selectGatewaysByGtwSq( gtw_sq );
        ResponseData( res, rows );        //게이트웨이 정보
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//게이트웨이 수정
router.post('/gateways/:gtw_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let gtw_sq = req.params.gtw_sq || '';
    let vals = {
        STE_SQ  : req.body['STE_SQ'],
        STE_ID  : req.body['STE_ID'],
        GTW_ID  : req.body['GTW_ID'],
        GTW_NM  : req.body['GTW_NM'],
        HW_MDL_CD : req.body['HW_MDL_CD'],
        SW_MDL_CD : req.body['SW_MDL_CD'],
        BIGO      : req.body['BIGO'],
    }


    try
    {
        await db.updateGateway(gtw_sq, vals) ;
        ResponseStat(res, "0", "수정성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//게이트웨이 삭제
router.delete('/gateways/:gtw_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let gtw_sq = req.params.gtw_sq || '';

    try
    {
        await db.deleteGateway( gtw_sq )
        ResponseStat(res, "0", "삭제성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//게이트웨이 등록
router.post('/gateways', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let vals = {
        STE_SQ  : req.body['STE_SQ'],
        STE_ID  : req.body['STE_ID'],
        GTW_ID  : req.body['GTW_ID'],
        GTW_NM  : req.body['GTW_NM'],
        HW_MDL_CD : req.body['HW_MDL_CD'],
        SW_MDL_CD : req.body['SW_MDL_CD'],
        BIGO      : req.body['BIGO'],
    }

    try
    {
        let gtw_sq = await db.insertGateway(vals) ;
        let data = { GTW_SQ : gtw_sq } ;
        ResponseData( res, data );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});








///////////////////////////////////////////////////////////////////
// 보고서 정보
///////////////////////////////////////////////////////////////////

//시간보고서 ( 지정된 단일현장 )  ( OK 2020-06 )
router.get('/sites/:ste_sq/report_hour', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    let frDate = req.query.FR_DATE || xgUtils.getCurDate() ;
    let toDate = req.query.TO_DATE || xgUtils.getCurDate() ;

    try
    {
        let rows = await db.selectHourReportBySite(ste_sq, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//일간보고서 ( 지정된 단일현장 ) ( OK 2020-06 )
router.get('/sites/:ste_sq/report_day', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    let frDate = req.query.FR_DATE || xgUtils.getCurDate() ;
    let toDate = req.query.TO_DATE || xgUtils.getCurDate() ;

    try
    {
        let rows = await db.selectDayReportBySite(ste_sq, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//월간보고서 ( 지정된 단일현장 )  ( OK 2020-06 )
router.get('/sites/:ste_sq/report_mon', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMM( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMM( cDate ) ;

    try
    {
        let rows = await db.selectMonthReportBySite(ste_sq, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//제어 내역 ( 지정된 단일현장 ) ( OK 2020-06 )
router.get('/sites/:ste_sq/report_ctrl', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMMDD( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMMDD( cDate ) ;

    try
    {
        let rows = await db.selectControlReport(null, ste_sq, null, null, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//동작내역  ( 지정된 단일현장 ) ( OK 2020-06 )
router.get('/sites/:ste_sq/report_onoff', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_sq = req.params.ste_sq || '';

    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMMDD( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMMDD( cDate ) ;

    try
    {
        let rows = await db.selectSwEvntReport(null, ste_sq, null, null, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});






//시간보고서 ( 지정된 단일오너 ) ( OK 2020-06 )
router.get('/owners/:own_sq/report_hour', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';


    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMMDDHH( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMMDDHH( cDate ) ;

    try
    {
        let rows = await db.selectHourReportByOwner(own_sq, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//일간보고서 ( 지정된 단일오너 ) ( OK 2020-06 )
router.get('/owners/:own_sq/report_day', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';


    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMMDD( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMMDD( cDate ) ;

    try
    {
        let rows = await db.selectDayReportByOwner(own_sq, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//월간보고서 ( 지정된 단일오너 ) ( OK 2020-06 )
router.get('/owners/:own_sq/report_mon', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMM( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMM( cDate ) ;

    try
    {
        let rows = await db.selectMonthReportByOwner(own_sq, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});




//제어 이력 ( 지정된 단일 오너 ) ( OK 2020-06 )
router.get('/owners/:own_sq/report_ctrl', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';

    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMMDD( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMMDD( cDate ) ;

    try
    {
        let rows = await db.selectControlReport(own_sq, null, null, null, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//플러그 ON/OFF 동작이력 (지정된 단일 오너) ( OK 2020-06 )
router.get('/owners/:own_sq/report_onoff', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let own_sq = req.params.own_sq || '';


    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMMDD( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMMDD( cDate ) ;

    try
    {
        let rows = await db.selectSwEvntReport(own_sq, null, null, null, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});





















//처리성공 여부  응답
function ResponseStat ( res, rcd = 0, rms='' ){
    let resBody = RES_PACKET(rcd, rms);

    let logStr = `Response Stat : ${JSON.stringify( resBody )}`;
    DEBUG && console.log( logStr );
    console.debug( logStr );

    res.send( resBody );
}

//데이터 응답
function ResponseData( res, rows, isSingleRow = false ){

    let resBody = RES_PACKET();
    if (isSingleRow) {
        if (rows && rows.length > 0)
        resBody.data = rows[0];
    }
    else {
        resBody.data = rows;
    }

    let logStr = `Response Data : ${JSON.stringify( resBody )}`;
    // DEBUG && console.log( logStr );
    console.debug( logStr );

    res.send( resBody );
}

//에러 응답
function ResponseError( res, reason ){

    let resBody =  RES_PACKET( 1, reason.message, reason )

    let logStr = `Response Error : ${JSON.stringify( resBody )}`;

    console.error( reason );
    console.error( logStr );

    res.send(resBody);
}

function  RES_PACKET(rcd = 0, rms='', data={}) {
    return { rcd:rcd, rms:rms, data:data };
}





module.exports = ( ) => {
    return router;
}

