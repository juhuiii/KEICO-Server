/**
 * Watchdog Timer
 * 5초 주기, MQTT를 이용하여 Adapter로 Polling 메세지를 던진다.
 * Adapter는 해당 메세지를 수신하여 /dev/watchdog에 Signal을 전송한다.
 */
const   C_AREA              = require('../common_area');

class WatchdogThread 
{
    constructor()
    {
        console.info( "[WatchdogThread] Watchdog Thread Startup OK .");

        this.mqttAdapter  = C_AREA.mqttAdapter ;

        setInterval ( () => {
            this.sendPoll(); 
        }, 5000);

    }

    sendPoll() {        
        const payload = {
            pkn: 0,
            cmd: 'WDT',
            tno: 0,
            data: new Date,
        };

        this.mqttAdapter.sendMessage(JSON.stringify(payload) );
        
        console.info( "[WatchdogThread] Polling Watchdog... ", payload);
    }
}

module.exports = new WatchdogThread();



