'use strict';
const dateFormat = require('dateformat');

const XGDateTime = {
    getCurDate()
    {
        return dateFormat(new Date(), "yyyymmdd") ;
    }, 
    getCurTime()
    {
        return dateFormat(new Date(), "HHMMss") ;
    },     
    getCurDateTime()
    {        
        return  dateFormat(new Date(), "yyyymmddHHMMss") ;
    }, 
    getCurHour()
    {
        return dateFormat(new Date(), "HH") ;
    },
    getCurYYYYMMDDHH()
    {
        return  dateFormat(new Date(), "yyyymmddHH") ;
    }, 
    getYYYYMMDD( pDate )
    {
        return dateFormat(pDate, "yyyymmdd") ;
    },
    getYYYYMM( pDate )
    {
        return dateFormat(pDate, "yyyymm") ;
    }, 
    getHH24MISS( pDate )
    {
        return dateFormat(pDate, "HHMMss") ;
    }, 
    getDiffSec( fr, to )
    {
        
        let fYear = parseInt(  fr / 10000000000 ) ;
        let fMon  = parseInt(((fr / 100000000 ) % 100) - 1) ;
        let fDay  = parseInt(( fr / 1000000) % 100);
        let fHour = parseInt(( fr / 10000) % 100 );
        let fMin  = parseInt(( fr / 100) % 100);
        let fSec  = parseInt(  fr % 100);


        let tYear = parseInt(  to / 10000000000 ) ;
        let tMon  = parseInt(((to / 100000000 ) % 100) - 1) ;
        let tDay  = parseInt(( to / 1000000) % 100);
        let tHour = parseInt(( to / 10000) % 100 );
        let tMin  = parseInt(( to / 100) % 100);
        let tSec  = parseInt(  to % 100);

        let frDate = new Date(fYear, fMon, fDay, fHour, fMin, fSec, 0);
        let toDate = new Date(tYear, tMon, tDay, tHour, tMin, tSec, 0);

        return toDate.getTime() - frDate.getTime();
    }, 
    
    isNotEmpty( value ){
        if( value !== undefined && value !== null && value !== "" ) return true;
        return false;
    }
};

module.exports = XGDateTime;
