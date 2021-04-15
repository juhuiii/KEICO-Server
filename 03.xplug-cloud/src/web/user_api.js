const express       = require('express');
const db            = require('../database');
const logger        = require('../utils/logger');
const C_AREA        = require('../common_area'); ;

const xgUtils       = require("../utils/utils");

let router = express.Router();
let mqttCloud     = C_AREA.mqttCloud;

let DEBUG = false;

// 로그인
router.get('/login', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let uid = req.query.uid || '';
    let pwd = req.query.pwd || '';

    try
    {
        let rows = await db.selectUser(uid);

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



// 사용자 정보 요청
router.get('/users/:usr_id', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let uid = req.params.usr_id || '';

    try
    {
        let rows = await db.selectUserSite(uid);

        if( rows.length <= 0 ){
            ResponseStat ( res, "1", "아이디를 확인 하세요" );
            return ;
        }

        ResponseData( res, rows , true);
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//사용자 정보 수정
router.post('/users/:usr_id', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let user_id = req.params.usr_id  || '';
    let usr_nm  = req.body['USR_NM'] || '';
    let pwd     = req.body['PWD']    || '';

    try
    {
        if( usr_nm == "" ){
            ResponseStat ( res, "1", "사용자명은 필수입니다." );
            return ;
        }

        if( pwd == "" ){
            ResponseStat ( res, "1", "비밀번호는 필수 입니다." );
            return ;
        }

        let rows = await db.updateUser(user_id, usr_nm, pwd);  //사용저정보 수정

        if( rows <= 0 ) {
            ResponseStat ( res, "1", "변경되지 않았습니다." );
            return ;
        }

        ResponseStat ( res, "0", "사용자정보변경 성공" );

    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});




// 현장정보
router.get('/sites/:ste_id', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';

    try
    {
        let rows = await db.selectSite(ste_id);

        ResponseData( res, rows , true);
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//현장내 플러그 목록
router.get('/:ste_id/plugs', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';

    try
    {
        let rows = await db.selectPlugs(ste_id);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//현장 및 게이트웨이내  플러그 목록
router.get('/:ste_id/:gtw_id/plugs', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        let rows = await db.selectPlugs(ste_id, gtw_id);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



// 현장 및 게이트웨이내 그룹 목록
router.get('/:ste_id/:gtw_id/groups', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        let rows = await db.selectPlugGroups(ste_id, gtw_id);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//현장 및 게이트웨이내  휴일 목록
router.get('/:ste_id/:gtw_id/holidays', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        let rows = await db.selectHolidays(ste_id, gtw_id);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//현장 및 게이트웨이내  스케쥴 목록
router.get('/:ste_id/:gtw_id/schedules', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        let rows = await db.selectSchedules(ste_id, gtw_id);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//현장 및 게이트웨이내  스케쥴+스케줄시간  목록
router.get('/:ste_id/:gtw_id/schedule_onces', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        let rows = await db.selectScheduleTms(ste_id, gtw_id);

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});





//현장 또는 게이트웨이 종합 시간보고서
router.get('/:ste_id/:gtw_id/report_hour', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let frDate = req.query.FR_DATE || xgUtils.getCurDate() ;
    let toDate = req.query.TO_DATE || xgUtils.getCurDate() ;

    try
    {
        let rows = await db.selectHourReport(ste_id, gtw_id, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});





//현장 또는 게이트웨이 종합 일간보고서
router.get('/:ste_id/:gtw_id/report_day', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let frDate = req.query.FR_DATE || xgUtils.getCurDate() ;
    let toDate = req.query.TO_DATE || xgUtils.getCurDate() ;

    try
    {
        let rows = await db.selectDayReport(ste_id, gtw_id, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});





//현장 또는 게이트웨이 종합 월간보고서
router.get('/:ste_id/:gtw_id/report_mon', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let cDate = new Date() ;
    let pDate = new Date();

    let frDate = req.query.FR_DATE || xgUtils.getYYYYMM( pDate ) ;
    let toDate = req.query.TO_DATE || xgUtils.getYYYYMM( cDate ) ;

    try
    {
        let rows = await db.selectMonthReport(ste_id, gtw_id, frDate, toDate );

        ResponseData( res, rows );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});















///////////////////////////////////////// GATEWAY로 보내는 명령 ////////////////////////////////////////
///////////////////////////////////////// GATEWAY로 보내는 명령 ////////////////////////////////////////
///////////////////////////////////////// GATEWAY로 보내는 명령 ////////////////////////////////////////

//지그비 채널 검색
router.get('/:ste_id/:gtw_id/find_channel', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { };
        let msgColud = makeGtwMeassge( "FIND_CHANNEL", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "ZIGBEE 채널검색 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});




//퍼밋조인
router.get('/:ste_id/:gtw_id/permit_join/:sec', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
    let sec    = req.params.sec    || '250';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { sec };
        let msgColud = makeGtwMeassge( "PERMIT_JOIN", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "ZIGBEE PERMIT JOIN 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//플러그 리포트 주기설정
router.get('/:ste_id/:gtw_id/report_config', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["zb_addr"] = req.query.addr64 || '';       //64 bit address
    param["knd"]     = req.query.knd    || '';       //kind  0(on/off),  1(kw) ,2(kwh)
    param["min"]     = req.query.min    || '';       //min
    param["max"]     = req.query.max    || '';       //max
    param["val"]     = req.query.val    || '';       //change value

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "REPORT_CONFIG", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "ZIGBEE REPORT CONFIG 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});



//Network(16 BIT) Address 요청
router.get('/:ste_id/:gtw_id/nwk_addr', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["zb_addr"] = req.query.addr64 || '';       //64 bit address

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "NWK_ADDR", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "ZIGBEE NETWORK ADDR(16 BIT) 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});





///////// 플러그 제어 시작 /////////
///////// 플러그 제어 시작 /////////
///////// 플러그 제어 시작 /////////
//플러그 개별 ON 제어 (현장)
router.get('/:ste_id/:gtw_id/:dev_id/on', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
    let dev_id = req.params.dev_id || '';

/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
    // 서울기업지원센터(shub03) : 07/24 ~ 7/30일까지 모바일에서 ON 제한
    let curDate = Number(xgUtils.getCurDate());
    if( curDate >= 20200724 && curDate <= 20200730 && ste_id == "shub03"){
        ResponseStat ( res, "1", `07/24 ~ 07/30일까지 ON제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////



    try

    //shub04 : 푸드코트
    {
        let rows = await db.selectPlugs( ste_id, gtw_id, dev_id );

        if( rows.length <= 0 ){
            ResponseStat ( res, "1", `존재하지 않은 플러그 입니다. 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
            return ;
        }

        let cmdBody = { dev_id };
        let msgColud = makeGtwMeassge( "ON", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud) );

        ResponseStat ( res, "0", "플러그 ON 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//플러그 개별 OFF 제어
router.get('/:ste_id/:gtw_id/:dev_id/off', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
    let dev_id = req.params.dev_id || '';

    let filter = req.query.filter  || '';   // 대기전력 체크 여부


/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    let curDate = Number(xgUtils.getCurDate());

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    try
    {
        let rows = await db.selectPlugs( ste_id, gtw_id, dev_id );

        if( rows.length <= 0 ){
            ResponseStat ( res, "1", `존재하지 않은 플러그 입니다. 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
            return ;
        }

        let cmdBody = { dev_id , filter };
        let msgColud = makeGtwMeassge( "OFF", cmdBody );

        // {ste_id}/{gateway_id}
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud) );

        ResponseStat ( res, "0", "플러그 OFF 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//플러그 전체 ALL ON 제어
router.get('/:ste_id/on', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';

/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
    // 서울기업지원센터(shub03) : 07/24 ~ 7/30일까지 모바일에서 ON 제한
    let curDate = Number(xgUtils.getCurDate());
    if( curDate >= 20200724 && curDate <= 20200730 && ste_id == "shub03"){
        ResponseStat ( res, "1", `07/24 ~ 07/30일까지 ON제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    try
    {
        let rows = await db.selectGateways( ste_id );

        if( rows.length <= 0 ) {
            ResponseStat ( res, "1", `존재하지 않은 현장 입니다.(${ste_id})` );
            return ;
        }

        let cmdBody = {};
        let msgColud = makeGtwMeassge( "ALL_ON", cmdBody );

        for ( let gtw of rows ){
            publishToGateway( ste_id, gtw['GTW_ID'], JSON.stringify ( msgColud ) );
        }

        ResponseStat ( res, "0", "플러그 ALL ON 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//플러그 전체 ALL OFF 제어
router.get('/:ste_id/off', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let filter = req.query.filter  || '';   // 대기전력 체크 여부


/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    let curDate = Number(xgUtils.getCurDate());


    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    try
    {

        let rows = await db.selectGateways( ste_id );

        if( rows.length <= 0 ) {
            ResponseStat ( res, "1", `존재하지 않은 현장 입니다.(${ste_id})` );
            return ;
        }

        let cmdBody = { filter };
        let msgColud = makeGtwMeassge( "ALL_OFF", cmdBody );

        for ( let gtw of rows ){
            publishToGateway( ste_id, gtw['GTW_ID'], JSON.stringify ( msgColud ) );
        }

        ResponseStat ( res, "0", "플러그 ALL OFF 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});




//게이트웨이 전체 ALL ON 제어
router.get('/:ste_id/:gtw_id/on', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';


/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
    // 서울기업지원센터(shub03) : 07/24 ~ 7/30일까지 모바일에서 ON 제한
    let curDate = Number(xgUtils.getCurDate());
    if( curDate >= 20200724 && curDate <= 20200730 && ste_id == "shub03"){
        ResponseStat ( res, "1", `07/24 ~ 07/30일까지 ON제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    try
    {
        let rows = await db.selectGateways( ste_id, gtw_id );

        if( rows.length <= 0 ) {
            ResponseStat ( res, "1", `존재하지 않은 현장 또는 게이트웨이 입니다.(${ste_id}/${gtw_id})` );
            return ;
        }

        let cmdBody = {};
        let msgColud = makeGtwMeassge( "ALL_ON", cmdBody );

        for ( let gtw of rows ){
            publishToGateway( ste_id, gtw['GTW_ID'], JSON.stringify ( msgColud ) );
        }

        ResponseStat ( res, "0", "플러그 ALL ON 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//게이트웨이 전체 ALL OFF 제어
router.get('/:ste_id/:gtw_id/off', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let filter = req.query.filter  || '';   // 대기전력 체크 여부


/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    let curDate = Number(xgUtils.getCurDate());

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    try
    {

        let rows = await db.selectGateways( ste_id, gtw_id );

        if( rows.length <= 0 ) {
            ResponseStat ( res, "1", `존재하지 않은 현장 또는 게이트웨이 입니다.(${ste_id}/${gtw_id})` );
            return ;
        }

        let cmdBody = { filter };
        let msgColud = makeGtwMeassge( "ALL_OFF", cmdBody );

        for ( let gtw of rows ){
            publishToGateway( ste_id, gtw['GTW_ID'], JSON.stringify ( msgColud ) );
        }

        ResponseStat ( res, "0", "플러그 ALL OFF 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});





//그룹 ON 제어
router.get('/:ste_id/:gtw_id/groups/:grp_sq/on', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
    let grp_sq = req.params.grp_sq || '';

/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
    // 서울기업지원센터(shub03) : 07/24 ~ 7/30일까지 모바일에서 ON 제한
    let curDate = Number(xgUtils.getCurDate());
    if( curDate >= 20200724 && curDate <= 20200730 && ste_id == "shub03"){
        ResponseStat ( res, "1", `07/24 ~ 07/30일까지 ON제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    try
    {
        let rows = await db.selectPlugGroups( ste_id, gtw_id, grp_sq );

        if( rows.length <= 0 ){
            ResponseStat ( res, "1", `존재하지 않은 그룹 입니다. (${ste_id}/${gtw_id}/groups/${grp_sq})` );
            return ;
        }

        let cmdBody = { grp_sq };
        let msgColud = makeGtwMeassge( "GROUP_ON", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify(msgColud) );

        ResponseStat ( res, "0", "그룹 ON 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//그룹 OFF 제어
router.get('/:ste_id/:gtw_id/groups/:grp_sq/off', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);

    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
    let grp_sq = req.params.grp_sq || '';

    let filter = req.query.filter  || '';   // 대기전력 체크 여부


/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////

    let curDate = Number(xgUtils.getCurDate());

    //서울기업지원센터(shub03) / 푸드코드(shub04) : 07/31 ~ 8/07 일까지 모바일에서 ON/OFF 제어 제한
    if( curDate >= 20200731 && curDate <= 20200807 && ( ste_id == "shub03" || ste_id == "shub04" ) ){
        ResponseStat ( res, "1", `07/31 ~ 08/07일까지 ON/OFF 제어 불가!! 일련번호(${ste_id}/${gtw_id}/${dev_id} )` );
        return ;
    }
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////
/////////////////////////////// 서울창업허브 성능시험중 임시 로직 ///////////////////////////////


    try
    {
        let rows = await db.selectPlugGroups( ste_id, gtw_id, grp_sq );

        if( rows.length <= 0 ){
            ResponseStat ( res, "1", `존재하지 않은 그룹 입니다. (${ste_id}/${gtw_id}/groups/${grp_sq})` );
            return ;
        }

        let cmdBody = { grp_sq , filter };
        let msgColud = makeGtwMeassge( "GROUP_OFF", cmdBody );

        // {ste_id}/{gateway_id}
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud) );

        ResponseStat ( res, "0", "그룹 OFF 제어요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

///////// 플러그 제어 끝 /////////
///////// 플러그 제어 끝 /////////
///////// 플러그 제어 끝 /////////










//장치(플러그)삭제
router.delete('/:ste_id/:gtw_id/devices/:zb_addr', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["zb_addr"] = req.params.zb_addr || '';       //64 bit address

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "DEL_DEV", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "플러그삭제 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//플러그 정보 수정
router.post('/:ste_id/:gtw_id/devices/:zb_addr', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};

    param["ZB_ADDR"]        = req.params.zb_addr        ;
    param["DEV_NM"]         = req.body["DEV_NM"]        ;
    param["DEV_GB"]         = req.body["DEV_GB"]        ;
    param["STBY_KW"]        = req.body["STBY_KW"]       ;
    param["OFF_DELY"]       = req.body["OFF_DELY"]      ;
    param["MANU_CTL_ALLOW"] = req.body["MANU_CTL_ALLOW"]    ;
    param["GRP_SQ"]         = req.body["GRP_SQ"]    ;


    if( param["MANU_CTL_ALLOW"] == 0 )    //전체제어 허용여부 {허용안하는경우 ON/OFF Zigbee그룹에서 제외 }
    {
        param["ZB_ONGRP_AID"] = 0;
        param["ZB_OFFGRP_AID"] = 0;
    }
    if( param["OFF_DELY"] > 0 )    //OFF지연값 설정시 OFF Zigbee그룹에서 제외
    {
        param["ZB_OFFGRP_AID"] = 0;
    }


    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "EDT_DEV", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "플러그수정 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});







//그룹 신규 등록
router.post('/:ste_id/:gtw_id/groups', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  req.body;

        let msgColud = makeGtwMeassge( "ADD_GROUP", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "그룹등록 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//그룹 삭제
router.delete('/:ste_id/:gtw_id/groups/:grp_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["GRP_SQ"] = req.params.grp_sq || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "DEL_GROUP", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "그룹삭제 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//그룹 정보 수정
router.post('/:ste_id/:gtw_id/groups/:grp_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["GRP_SQ"] = req.params.grp_sq || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  req.body;
        cmdBody["GRP_SQ"] = param["GRP_SQ"];

        let msgColud = makeGtwMeassge( "EDT_GROUP", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "그룹수정 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});








//휴일 신규 등록
router.post('/:ste_id/:gtw_id/holidays', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  req.body;

        let msgColud = makeGtwMeassge( "ADD_HOLI", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "휴일등록 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});


//휴일 삭제
router.delete('/:ste_id/:gtw_id/holidays/:holi_dt', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["HOLI_DT"] = req.params.holi_dt || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "DEL_HOLI", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "휴일삭제 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//휴일 정보 수정
router.post('/:ste_id/:gtw_id/holidays/:holi_dt', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["HOLI_DT"] = req.params.holi_dt || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  req.body;
        cmdBody["HOLI_DT"] = param["HOLI_DT"];

        let msgColud = makeGtwMeassge( "EDT_HOLI", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "휴일변경 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});







// //스케쥴 신규 등록
// router.post('/:ste_id/:gtw_id/schedules', async (req, res) => {

//     DEBUG && console.log("Request : ", req.method, req.originalUrl);
//     let ste_id = req.params.ste_id || '';
//     let gtw_id = req.params.gtw_id || '';

//     try
//     {
//         if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

//         let cmdBody =  req.body;

//         let msgColud = makeGtwMeassge( "ADD_SCHD", cmdBody );

//         publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

//         ResponseStat ( res, "0", "스케쥴등록 요청 성공" );
//     }
//     catch ( reason )
//     {
//         ResponseError( res, reason );
//     }
// });

// //스케쥴 삭제
// router.delete('/:ste_id/:gtw_id/schedules/:schd_sq', async (req, res) => {

//     DEBUG && console.log("Request : ", req.method, req.originalUrl);
//     let ste_id = req.params.ste_id || '';
//     let gtw_id = req.params.gtw_id || '';

//     let param = {};
//     param["SCHD_SQ"] = req.params.schd_sq || '';

//     try
//     {
//         if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

//         let cmdBody =  param;
//         let msgColud = makeGtwMeassge( "DEL_SCHD", cmdBody );

//         publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

//         ResponseStat ( res, "0", "스케쥴삭제 요청 성공" );
//     }
//     catch ( reason )
//     {
//         ResponseError( res, reason );
//     }
// });

// //스케쥴 정보 수정
// router.post('/:ste_id/:gtw_id/schedules/:schd_sq', async (req, res) => {

//     DEBUG && console.log("Request : ", req.method, req.originalUrl);
//     let ste_id = req.params.ste_id || '';
//     let gtw_id = req.params.gtw_id || '';

//     let param = {};
//     param["SCHD_SQ"] = req.params.schd_sq || '';

//     try
//     {
//         if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

//         let cmdBody =  req.body;
//         cmdBody["SCHD_SQ"] = param["SCHD_SQ"];

//         let msgColud = makeGtwMeassge( "EDT_SCHD", cmdBody );

//         publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

//         ResponseStat ( res, "0", "스케쥴변경 요청 성공" );
//     }
//     catch ( reason )
//     {
//         ResponseError( res, reason );
//     }
// });







// //시간 스케쥴 신규 등록
// router.post('/:ste_id/:gtw_id/schedules_times', async (req, res) => {

//     DEBUG && console.log("Request : ", req.method, req.originalUrl);
//     let ste_id = req.params.ste_id || '';
//     let gtw_id = req.params.gtw_id || '';

//     try
//     {
//         if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

//         let cmdBody =  req.body;

//         let msgColud = makeGtwMeassge( "ADD_SCHD_TM", cmdBody );

//         publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

//         ResponseStat ( res, "0", "시간스케쥴등록 요청 성공" );
//     }
//     catch ( reason )
//     {
//         ResponseError( res, reason );
//     }
// });

// //시간 스케쥴 삭제
// router.delete('/:ste_id/:gtw_id/schedules_times/:schd_tm_sq', async (req, res) => {

//     DEBUG && console.log("Request : ", req.method, req.originalUrl);
//     let ste_id = req.params.ste_id || '';
//     let gtw_id = req.params.gtw_id || '';

//     let param = {};
//     param["SCHD_TM_SQ"] = req.params.schd_tm_sq || '';

//     try
//     {
//         if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

//         let cmdBody =  param;
//         let msgColud = makeGtwMeassge( "DEL_SCHD_TM", cmdBody );

//         publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

//         ResponseStat ( res, "0", "시간스케쥴삭제 요청 성공" );
//     }
//     catch ( reason )
//     {
//         ResponseError( res, reason );
//     }
// });

// //시간 스케쥴 정보 수정
// router.post('/:ste_id/:gtw_id/schedules_times/:schd_tm_sq', async (req, res) => {

//     DEBUG && console.log("Request : ", req.method, req.originalUrl);
//     let ste_id = req.params.ste_id || '';
//     let gtw_id = req.params.gtw_id || '';

//     let param = {};
//     param["SCHD_TM_SQ"] = req.params.schd_tm_sq || '';

//     try
//     {
//         if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

//         let cmdBody =  req.body;
//         cmdBody["SCHD_TM_SQ"] = param["SCHD_TM_SQ"];

//         let msgColud = makeGtwMeassge( "EDT_SCHD_TM", cmdBody );

//         publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

//         ResponseStat ( res, "0", "시간스케쥴변경 요청 성공" );
//     }
//     catch ( reason )
//     {
//         ResponseError( res, reason );
//     }
// });






//동시 스케쥴 등록  (일간스케쥴 1:1 시간스케쥴)
router.post('/:ste_id/:gtw_id/schedule_once', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  req.body;

        let msgColud = makeGtwMeassge( "ADD_SCHD_ONCE", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "스케쥴 동시등록  요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});

//동시 스케쥴 삭제 (일간스케쥴 1:1 시간스케쥴)
router.delete('/:ste_id/:gtw_id/schedule_once/:schd_sq', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    let param = {};
    param["SCHD_SQ"] = req.params.schd_sq || '';

    try
    {
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody =  param;
        let msgColud = makeGtwMeassge( "DEL_SCHD_ONCE", cmdBody );

        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );

        ResponseStat ( res, "0", "스케쥴 동시삭제 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
});












// 현장아이디 및 게이트웨이 존재여보 확인
async function checkSiteAndGateWayID( res, ste_id , gtw_id){

    let rtn = false;
    try{
        let rows = await db.selectGateways( ste_id, gtw_id );

        if( !rows || !Array.isArray( rows ) || rows.length <= 0 ) {
            ResponseStat ( res, "1", `존재하지 않은 현장(${ste_id}) 또는 게이트웨이(${ste_id}) 입니다.` );
            rtn = false;
        }else{
            rtn = true;
        }
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }
    return rtn;
}


function makeGtwMeassge( cmd, body ){

    if( !body ) body = {};

    let jsonMsg = {
        hd : { cmd : cmd },
        bd : body
    };

    return jsonMsg;
}

/**
 *  MQTT Data 전송
 */
function publishToGateway( ste_id, gtw_id, data ){
    let topic = `${ste_id}/${gtw_id}`;   // {ste_id}/{gateway_id}/

    mqttCloud.sendMessage(topic, data);

    DEBUG && console.log(`Publish (${topic}) : ${data}`);
}

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
    DEBUG && console.log( logStr );
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

