'use strict';
require('../utils/logger');
const   C_AREA          = require('../common_area');

// 아답터에서 받은 메세지 처리 로직 

class AdapterMessage {
    
    constructor() {

    }
    
    proc( message ){
                
        let jsonMsg = JSON.parse(message);     

        switch( jsonMsg.cmd  )
        {
            case 'SC'           :   //Scan Channel
            case 'JOIN_START'   :   //Permit Join Start 
            case 'JOIN_STOP'    :   //Permit Join Stop                
            case 'ON'           :   //Switch ON 
            case 'OFF'          :   //Switch OFF
            case 'DEV_DEL'      :   //Delete Device                
            case 'CH'           :   //Read Channel           //  Packet kind = 3 or 0
            case 'ONOFF'        :                               // Packet Kind = 0
            case 'DEV_ADD'      : 
            case 'KW'           : 
            case 'KWH'          :            
            case 'GROUP'        :
            case 'READ'         :
            case 'CTL'          :
                break;
            default :
                console.error( `unknown command='${jsonMsg.cmd}'` );
        }

        return jsonMsg;        
    }    
}


module.exports = new AdapterMessage();
    
    