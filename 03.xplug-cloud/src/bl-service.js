'use strict';
const EventEmitter = require('events');

const db = require('./database');

class BLService 
{
    constructor()  {    }

    async onMessageCloud( ste_id, gtw_id, cludeMsg ) {

        let jsonMsg = JSON.parse(cludeMsg);

        try{
            if( jsonMsg.hd.cmd == "ADAPTER" )  //아답터에서 발생한 메세지 
            {            
                procAdapterMessage(jsonMsg );
            }
            else {
                console.error( `unknown CLOUDE command='${jsonMsg.cmd}'` );
            }
        }catch(err){
            console.error( err );
            throw err;
        }
    }     



    async procAdapterMessage(){

        switch( jsonMsg.bd.cmd ) 
        {            
            case 'ONOFF'        :                               // ON/OFF 상태 변경 
                await this.procMeasOnOff( ste_id, gtw_id, jsonMsg.bd );                    
                break;
            case 'DEV_ADD'      :                               // JOIN ANNOUNCE
                db.insertNewPlug(jsonMsg.bd); 
                break;
            case 'KW'           : 
                await this.procMeasKw(ste_id, gtw_id, jsonMsg.bd); 
                break;
            case 'KWH'          :
                await this.procMeasKwh (ste_id, gtw_id, jsonMsg.bd); 
                break;
            case 'GROUP'         :
                await this.procMeasZbGroup(ste_id, gtw_id, jsonMsg.bd); 
                break;
            default :
                console.error( `unknown ADAPTER command='${jsonMsg.bd.cmd}'` );
        }

    }
    

    

}

module.exports = new BLService();
