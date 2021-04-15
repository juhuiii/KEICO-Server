import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-test-control',
  templateUrl: './test-control.component.html',
  styleUrls: ['./test-control.component.scss']
})
export class TestControlComponent implements OnInit {

  public plugs = [];
  public tests = [];    //테스트 진행정보

  public timer1: any;


  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.init();
  }

 init() {
    this.updateData();
    this.timer1 = setInterval(() => {
        this.updateData();

        this.runTest();


    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer1);
  }



  trackPlug(index, item) {
    return item.ZB_ADDR;
  }

  trackGroup(index, item) {
    return item.GRP_SQ;
  }

  trackIndex(index, item) {
    return index;
  }


  runTest(){

    this.plugs.forEach( item => {

        let tInfo =  item.testInfo;

        if( tInfo.isTesting == false ) return ;

        if( item.SW_ST === 1 ){ // 현재상테 : ON -> OFF 제어테스트

          let goTest = (tInfo.lstTestTime == null) ;
          if( goTest == false ){
            let aNow = new Date();

            let overSec = Math.abs(  (aNow.getTime() - tInfo.lstTestTime.getTime()) / 1000 );

            if( overSec >= tInfo.testInterval ) goTest = true;
          }

          if( goTest ){

            this.api.onoff(item.ZB_ADDR, "off", "n").subscribe(data => {
              console.log( "OK OFF CONTROL TEST" )
            }, error => {
              console.log(error);
            });

            tInfo.offTestCnt++;
            tInfo.offTestTime  = new Date();
            tInfo.lstTestTime  = new Date();

            tInfo.onclass["testing"] = false;
            tInfo.offclass["testing"] = true;

          }
        }else{    // 현재상테 : OFF -> ON 제어테스트

          let goTest = (tInfo.lstTestTime  == null) ;
          if( goTest == false ){
            let aNow = new Date();

            let overSec = Math.abs(  (aNow.getTime() - tInfo.lstTestTime.getTime()) / 1000 );

            if( overSec >= tInfo.testInterval ) goTest = true;
          }

          if( goTest ){

            this.api.onoff(item.ZB_ADDR, "on", "n").subscribe(data => {
              console.log( "OK ON CONTROL TEST" )
            }, error => {
              console.log(error);
            });

            tInfo.onTestCnt++;
            tInfo.onTestTime    = new Date();
            tInfo.lstTestTime   = new Date();


            tInfo.onclass["testing"] = true;
            tInfo.offclass["testing"] = false;
          }


        }
    });

  }

  updateData() {
    this.plugs = this.api.getPlugs();


    this.plugs.forEach( item => {


      let arrFindTestInfo = this.getTestInfo( item.ZB_ADDR );

      if( arrFindTestInfo === undefined || arrFindTestInfo == null || arrFindTestInfo.length <= 0 ) {

        let nTestInfo =
        { zbaddr : item.ZB_ADDR ,
          isTesting : false,
          onTestCnt : 0,
          offTestCnt : 0 ,
          onTestTime : null ,
          offTestTime : null,
          lstTestTime : null,
          testInterval : 10,
          onclass : {
            "text-center" : true,
            "testing" : false
          },
          offclass : {
            "text-center" : true,
            "testing" : false
          }
        };

        this.tests.push (
          nTestInfo
        );

        item.testInfo = nTestInfo;
      }
      else{
        item.testInfo = arrFindTestInfo[0];
      }


    });
  }



  getTestInfo( zbaddr ){

    return  this.tests.filter( test => { return test.zbaddr === zbaddr });
  }




  onClickRun( item ){

    if( item.testInfo.isTesting )
    {
      item.testInfo.isTesting = false;
    }
    else
    {
      item.testInfo.isTesting = true;
      item.testInfo.onTestCnt = 0,
      item.testInfo.offTestCnt = 0 ,
      item.testInfo.onTestTime = null,
      item.testInfo.offTestTime = null;

      item.testInfo.lstTestTime = null;
    }
  }


  onchangeItvl(item , value){
    item.testInfo.testInterval = value;
  }

}
