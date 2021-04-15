'use strict';

const   C_AREA          = require('../common_area');
var     db              = C_AREA.database;

// 아답터에서 받은 메세지 처리 로직 
class AdapterMessage {
    
    constructor() {        
    }
    
    async proc( ste_id, gtw_id, jsonMsg )
    {     
        console.info(`do not process for adapter message(command='${jsonMsg.bd.cmd}')(${ste_id}/${gtw_id})` );
        return;

        try{
            switch( jsonMsg.bd.cmd ) 
            {            
                case 'ONOFF'        :                               // ON/OFF 상태 변경 
                    // await this.procMeasOnOff( ste_id, gtw_id, jsonMsg.bd );                    
                    break;
                case 'DEV_ADD'      :                               // JOIN ANNOUNCE
                    // db.insertTmSmartPlug(jsonMsg.bd); 
                    break;
                case 'KW'           : 
                    // await this.procMeasKw(ste_id, gtw_id, jsonMsg.bd); 
                    break;
                case 'KWH'          :
                    // await this.procMeasKwh (ste_id, gtw_id, jsonMsg.bd); 
                    break;
                case 'GROUP'         :
                    // await this.procMeasZbGroup(ste_id, gtw_id, jsonMsg.bd); 
                    break;
                default :
                    console.error( `ADAPTER unknown command='${jsonMsg.bd.cmd}'` );
            }
            
        }catch( reason ) {
            console.error( JSON.stringify( reason )  );
            throw reason;
        }
    }  
    
    
   
    //ON / OFF 상태 변경 
    async procMeasOnOff(ste_id, gtw_id, adtMsg) {

        try{
            let dev_id = adtMsg.data.addr64;
            let sw_st  = adtMsg.data.value ;

            let aff_cnt_dev  = await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            if( aff_cnt_dev <= 0 ) {
                await this.db.insertDevice(ste_id, gtw_id, dev_id);
                await this.db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            }

            let aff_cnt_plug = await db.updatePlugOnOff(ste_id, gtw_id, dev_id, sw_st);
            if( aff_cnt_plug <= 0 ) {
                await db.insertTmSmartPlug(ste_id, gtw_id, dev_id);
                await db.updatePlugOnOff(ste_id, gtw_id, dev_id, sw_st);
            }
        } catch( reason ) {          
            throw reason;
        }
    }

    //KW 변경
    async procMeasKw(ste_id, gtw_id, adtMsg) {

        try{
            let dev_id = adtMsg.data.addr64;
            let kw     = adtMsg.data.value ;

            let aff_cnt_dev  = await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            if( aff_cnt_dev <= 0 ) {
                await db.insertDevice(ste_id, gtw_id, dev_id);
                await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            }

            let aff_cnt_plug = await db.updatePlugKw (ste_id, gtw_id, dev_id, kw);
            if( aff_cnt_plug <= 0 ) {
                await thidb.insertTmSmartPlug(ste_id, gtw_id, dev_id);
                await db.updatePlugKw(ste_id, gtw_id, dev_id, kw);
            }
        } catch( reason ) {          
            throw reason;
        }
    }

    //KWH 변경
    async procMeasKwh(ste_id, gtw_id, adtMsg) { 

        
        try{
            let dev_id = adtMsg.data.addr64;
            let kwh    = adtMsg.data.value ;

            let aff_cnt_dev  = await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            if( aff_cnt_dev <= 0 ) {
                await db.insertDevice(ste_id, gtw_id, dev_id);
                await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            }

            let aff_cnt_plug = await db.updatePlugKwh(ste_id, gtw_id, dev_id, kwh);
            if( aff_cnt_plug <= 0 ) {
                await db.insertTmSmartPlug(ste_id, gtw_id, dev_id);
                await db.updatePlugKwh(ste_id, gtw_id, dev_id, kwh);
            }
        } catch( reason ) {          
            throw reason;
        }
    }

    //ZB GROUP 변경
    async procMeasZbGroup(ste_id, gtw_id, adtMsg) { 

        
        try{
            let dev_id  = adtMsg.data.zb_addr;
            let groups  = adtMsg.data.groups ;

            let aff_cnt_dev  = await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            if( aff_cnt_dev <= 0 ) {
                await db.insertDevice(ste_id, gtw_id, dev_id);
                await db.updateDeviceRcvDt (ste_id, gtw_id, dev_id);
            }

            let aff_cnt_plug = await db.updatePlugZbGroup(ste_id, gtw_id, dev_id, groups);
            if( aff_cnt_plug <= 0 ) {
                await db.insertTmSmartPlug(ste_id, gtw_id, dev_id);
                await db.updatePlugZbGroup(ste_id, gtw_id, dev_id, groups);
            }
        } catch( reason ) {          
            throw reason;
        }
    }
}

module.exports = new AdapterMessage();
    
