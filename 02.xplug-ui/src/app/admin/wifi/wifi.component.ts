import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';

@Component({
  selector: 'app-wifi',
  templateUrl: './wifi.component.html',
  styleUrls: ['./wifi.component.scss']
})
export class WifiComponent implements OnInit {

  @ViewChild("taNetwork") taNetwork : ElementRef; 
  @ViewChild("taWifi") taWifi : ElementRef; 
  
  

  public ipMode : any;

  public eth0_info       : any ;
  public wlan0_info      : any ;
  public wifi_scan_list  : any ;
  public networkFile    : string;


  public subscA : Subscription;
  public subscB : Subscription;
  public subscC : Subscription;
  public subscD : Subscription;
  public subscE : Subscription;
  public subscF : Subscription;



  constructor( private api: ApiService , private modal : XgModalService) { }


  ngOnInit() {
    this.readNetwork();
    this.readWifi()
  }

  
  readWifi(){
   

    //와이파이 스캔 목록
    this.subscB && this.subscB.unsubscribe();
    this.subscB = this.api.getWifiScan().subscribe(response => {

      if (response['rcd'] === 0) {
        this.wifi_scan_list = response['data'];      
      } 
    }, error => {
      console.log(error);
    });


    
   //Wifi 파일 조회 
   this.subscE && this.subscE.unsubscribe();
   this.subscE =  this.api.getWifiFile().subscribe(response => {

     if (response['rcd'] === 0) {
       this.taWifi.nativeElement.value = "";
       this.taWifi.nativeElement.value = response['data'];        
     } 
   }, error => {
     console.log(error);
   });
 

  }

  readNetwork(){

    //현재 네트워크 정보 
    this.subscA && this.subscA.unsubscribe();
    this.subscA= this.api.getNetworkInfo().subscribe(response => {

      if (response['rcd'] === 0) {
        let tmp = response['data'];
        tmp.forEach(item => {
          if( item['name'] == "eth0" )
            this.eth0_info = item ;
          else if( item['name'] == "wlan0" ){
            this.wlan0_info = item;
          }
        });       
      } 
    }, error => {
      console.log(error);
    });



    //네트워크 파일 조회 
    this.subscC && this.subscC.unsubscribe();
    this.subscC =  this.api.getNetworkFile().subscribe(response => {

      if (response['rcd'] === 0) {
        this.taNetwork.nativeElement.value = "";
        this.taNetwork.nativeElement.value = response['data'];        
      } 
    }, error => {
      console.log(error);
    });
  }


  saveNetwork(){

    const initialState = {      
      title : "저장", 
      message  : "네트워크 설정을 저장 하시겠습니까?" ,
      confirmBtnName : "저장",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {      
              
      let fileC = {file : this.taNetwork.nativeElement.value };

      //네트워크 파일 조회 
      this.subscD && this.subscD.unsubscribe();
      this.subscD =  this.api.saveNetworkFile(  fileC  ).subscribe(response => {

        if (response['rcd'] === 0) {
          this.modal.alert("저장성공",  "저장 되었습니다." );  
        } else {
          this.modal.alert("저장실패",  "저장되지 않았습니다.  관리자 문의 바랍니다." );
        }
      }, error => {
        this.modal.alert("저장실패",  "저장되지 않았습니다.  관리자 문의 바랍니다." );
      });
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });
  }



  saveWifi(){



    const initialState = {      
      title : "저장", 
      message  : "WIFI 설정을 저장 하시겠습니까?" ,
      confirmBtnName : "저장",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {      
              
      let fileC = {file : this.taWifi.nativeElement.value };

      //네트워크 파일 조회 
      this.subscF && this.subscF.unsubscribe();
      this.subscF =  this.api.saveWifiFile(  fileC  ).subscribe(response => {

        if (response['rcd'] === 0) {
          this.modal.alert("저장성공",  "저장 되었습니다." );  
        } else {
          this.modal.alert("저장실패",  "저장되지 않았습니다.  관리자 문의 바랍니다." );
        }
      }, error => {
        this.modal.alert("저장실패",  "저장되지 않았습니다.  관리자 문의 바랍니다." );
      });
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });


  }




  restartNetwork(){
    const initialState = {      
      title : "네트워크", 
      message  : "네트워크를 재시작 하겠습니까? " ,
      confirmBtnName : "재시작",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {      
              
      let fileC = {file : this.taWifi.nativeElement.value };

      //네트워크 파일 조회 
      this.subscF && this.subscF.unsubscribe();
      this.subscF =  this.api.restartNetwork().subscribe(response => {

        if (response['rcd'] === 0) {
          this.modal.alert("성공",  "네트워크 재시작 되었습니다." );  
        } else {
          this.modal.alert("실패",  "네트워크 재시작을 실패 했스니다." );
        }
      }, error => {
        this.modal.alert("실패",  "네트워크 재시작을 실패 했스니다." );
      });
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });
  }


}
