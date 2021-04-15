import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { ConnectionService } from 'ng-connection-service';
import { Subscription } from 'rxjs';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
 
@Component({
  selector: 'app-bottom',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.scss']
})
export class BottomComponent implements OnInit, OnDestroy {

  public now = "";

  public subScbA : Subscription = null;
  public subScbB : Subscription = null;
  public subScbC : Subscription = null;
  public intvA   : any = null;
  public intvB   : any = null;

  public lastApiTime : Date ; 
  
  constructor(public api: ApiService, private connectionService: ConnectionService, private modal: XgModalService, private spinner: Ng4LoadingSpinnerService ){ 

    this.lastApiTime = moment(new Date()).add(-1, 'days').toDate();   //최종수신 시간 초기화 
  }

  ngOnInit() {
    
    this.intvA = setInterval(() => { this.updateTime();   }, 1000  );     //시계
    this.intvB = setInterval(() => { this.checkGateway(); }, 20000 );   //Gateway 연결 체크 
    
    this.subScbA && this.subScbA.unsubscribe();
    this.subScbA = this.connectionService.monitor().subscribe(isConnected => {
      this.api.isNetworkErr = !isConnected;      
    });

        
    this.updateTime();
    this.checkGateway();
  } 

  ngOnDestroy(){
    this.subScbA && this.subScbA.unsubscribe();
    this.subScbB && this.subScbB.unsubscribe();

    clearInterval( this.intvA );
    clearInterval( this.intvB );
  }

  updateTime() {
    this.now = moment().format("YYYY-MM-DD HH:mm:ss");   
     
    let aNow = new Date();

    let overSec = Math.abs(  (aNow.getTime() - this.lastApiTime.getTime()) / 1000 );
   
    if( overSec > 30 )    //60초동안 API 데이터 수신을 못했다면 Gateway 연결 에러   
      this.api.isGatewayErr = true;    
    else    
      this.api.isGatewayErr = false;


  }


  checkGateway(){   
    
    this.subScbB && this.subScbB.unsubscribe();
    this.subScbB = this.api.getSites().subscribe(  (data) => {
       this.lastApiTime = new Date();     
      }
    );
  }

  onClickRefresh(){

    this.subScbC && this.subScbC.unsubscribe();
    this.subScbC  = this.modal.confirm("확인", "새로고침 하시겠습니까?").subscribe(result => {      

      if( result == 1 ) {

        this.spinner.show();

        this.subScbB && this.subScbB.unsubscribe();        
        this.subScbB = this.api.getSites().subscribe(  (data) => {         
            this.spinner.hide();
            window.location.reload();
          }
        );
        
      }
    });
  }
}
