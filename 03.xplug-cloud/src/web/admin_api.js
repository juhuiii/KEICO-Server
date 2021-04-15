const express       = require('express');
const db            = require('../database');
const logger        = require('../utils/logger');
const  C_AREA       = require('../common_area'); ;

let routerAdm       = express.Router();
let mqttCloud       = C_AREA.mqttCloud;

let DEBUG = false;

//지그비 그룹 초기화  
routerAdm.get('/:ste_id/:gtw_id/reset_zbgroup', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';

    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { };
        let msgColud = makeGtwMeassge( "ZB_GROUP_RESET", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "ZIGBEE 그룹 초기화 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});




//지그비 그룹핑 진행율 조회 
routerAdm.get('/:ste_id/:gtw_id/stat_zbgroup', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
        
    try
    {   
        
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;
        
        let rows = await db.selectZbGroupingStat(ste_id, gtw_id);
        
        ResponseData( res, rows, true );
    
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});




//지그비 장치명 순번으로 초기화 (001,002..)
routerAdm.get('/:ste_id/:gtw_id/devices/devnm_init', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
       
    let ignore_pre_set = req.query.ignore_pre_set || 'n' ;     //이전설정 무시여부 (기본 무시 하지 않음)

    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { ignore_pre_set };
        let msgColud = makeGtwMeassge( "DEV_NAME_INIT", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "ZIGBEE 장치명 초기화 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});




//게이트웨이 네트워크 목록 읽기 
routerAdm.get('/:ste_id/:gtw_id/network', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
        
    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { };
        let msgColud = makeGtwMeassge( "NET_LIST", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "게이트웨이 네트워크 읽기 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});






//게이트웨이 와이파이 목록 읽기 
routerAdm.get('/:ste_id/:gtw_id/wifi', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
        
    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { };
        let msgColud = makeGtwMeassge( "WIFI_LIST", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "게이트웨이 와이파이 목록 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});










//게이트웨이 와이파이설정 파일 읽기 
routerAdm.get('/:ste_id/:gtw_id/wifi_file', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
        
    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { };
        let msgColud = makeGtwMeassge( "WIFI_FILE_READ", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "게이트웨이 와이파이 설정파일 읽기 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});





//네트워크설정 파일 읽기 
routerAdm.get('/:ste_id/:gtw_id/net_file', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
        
    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = { };
        let msgColud = makeGtwMeassge( "NET_FILE_READ", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "게이트웨이 네트워크 설정파일 읽기 요청 성공" );
    }
    catch ( reason )
    {
        ResponseError( res, reason );
    }            
});





// network 파일 설정 
routerAdm.post('/:ste_id/:gtw_id/net_file', async (req, res) => {

    DEBUG && console.log("Request : ", req.method, req.originalUrl);
    let ste_id = req.params.ste_id || '';
    let gtw_id = req.params.gtw_id || '';
        
    // let e_yn    = req.body["e_yn"]   || '';
    // let e_addr  = req.body["e_addr"] || '';
    // let e_mask  = req.body["e_mask"] || '';
    // let e_gate  = req.body["e_gate"] || '';

    // let w_yn   = req.body["e_yn"]    || '';
    // let w_addr = req.body["w_addr"]  || '';
    // let w_mask = req.body["w_mask"]  || '';
    // let w_gate = req.body["w_gate"]  || '';

    try
    {   
        if( await checkSiteAndGateWayID( res, ste_id , gtw_id) == false ) return;

        let cmdBody = req.body;
        let msgColud = makeGtwMeassge( "NET_FILE_SET", cmdBody );   
        
        publishToGateway( ste_id, gtw_id, JSON.stringify ( msgColud ) );            

        ResponseStat ( res, "0", "게이트웨이 네트워크 파일 설정 요청 성공" );
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
            ResponseStat( res, "1", `존재하지 않은 현장(${ste_id}) 또는 게이트웨이(${ste_id}) 입니다.` );
            rtn = false;
        }
        else
        {
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

    console.error ( reason );    
    console.error( logStr );
    
    res.send(resBody);
}

function  RES_PACKET(rcd = 0, rms='', data={}) {
    return { rcd:rcd, rms:rms, data:data };
}

module.exports = ()  => {    
    return routerAdm;
}

