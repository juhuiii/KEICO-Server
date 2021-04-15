import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';

@Component({
  selector: 'app-zigbee',
  templateUrl: './zigbee.component.html',
  styleUrls: ['./zigbee.component.scss']
})
export class ZigbeeComponent implements OnInit, OnDestroy {

  
  

  public TOT_DEV_CNT = 0;

  public READGRP_SYNC_CNT = 0;
  public ONGRP_SYNC_CNT = 0;
  public OFFGRP_SYNC_CNT  = 0;
  
  public READGRP_DEV_CNT    = 0;
  public ONGRP_DEV_CNT    = 0;
  public OFFGRP_DEV_CNT    = 0;
  
  constructor( public api : ApiService, public modal:XgModalService) { }
  
  
  ngOnInit() {
    this.updateData();
  }

  updateData() {

    this.api.getZbGroupStat().subscribe( res =>{     
    
      this.TOT_DEV_CNT = res["data"]["TOT_DEV_CNT"];
      this.READGRP_SYNC_CNT  = res["data"]["READGRP_SYNC_CNT"];  //REA GROUP 동기화 완료된 갯수 
      this.ONGRP_SYNC_CNT    = res["data"]["ONGRP_SYNC_CNT"  ];  //ON GROUP 동기화 완료된 갯수 
      this.OFFGRP_SYNC_CNT   = res["data"]["OFFGRP_SYNC_CNT" ];  //OF GROUP 동기화 완료된 갯수 
  
      this.READGRP_DEV_CNT = res["data"]["READGRP_DEV_CNT"];  // REED 그룹 플러그수 
      this.ONGRP_DEV_CNT   = res["data"]["ONGRP_DEV_CNT"];    // ON   그룹의 플러그수 
      this.OFFGRP_DEV_CNT  = res["data"]["OFFGRP_DEV_CNT"];   // OFF  그룹의 플러그수 

      console.log( res["data"] );      
    
      setTimeout( ()=>{
        this.updateData();
        }, 3000);
    });    
  }
  
  ngOnDestroy(){      
  }


  initZigbeeGroup()
  {
    this.modal.confirm("초기화", "정말 초기화 하시겠습니까?").subscribe( confirm => {
      
      if (confirm === 1)
      {
        this.api.getZbGroupReset().subscribe( res =>{                   
          this.modal.alert( "초기화처리", res["rms"] );    
        });    
      }
    });
  }


  //리포트전송 주기 설정 ( 브로드 케스팅 )
  reportConfigAll(knd, min, max, val){

    
    this.api.setReportConfig("FFFFFFFFFFFFFFFF", knd, min, max, val).subscribe( res => {

      this.modal.alert( "Report 설정", "요청완료" );

    },
    err => {        
      this.modal.alert( "Report 설정", "요청을 실패 하였습니다." );
      
      console.log("Error occured");
    });

  }
}
