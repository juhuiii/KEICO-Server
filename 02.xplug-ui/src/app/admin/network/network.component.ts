import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import { Angular2FontawesomeModule } from 'angular2-fontawesome';



@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {

  

  public netFile   :any = { e_yn:"0", e_addr :"", e_gate:"", e_mask:"", 
                            w_yn:"0", w_addr :"", w_gate:"", w_mask:"" };
  public wifiFile  :any = { ssid:"", psk:"", key_mgmt:"WPA-PSK"};  
  public wifi_scan_list : any = {};

  public singleModel = "0";

  public subscA : Subscription;
  public subscB : Subscription;
  public subscC : Subscription;
  public subscD : Subscription;
  public subscE : Subscription;
  public subscF : Subscription;


  @ViewChild('e_addr') e_addr: ElementRef;
  @ViewChild('e_gate') e_gate: ElementRef;
  @ViewChild('e_mask') e_mask: ElementRef;
  @ViewChild('w_addr') w_addr: ElementRef;
  @ViewChild('w_gate') w_gate: ElementRef;
  @ViewChild('w_mask') w_mask: ElementRef;


  @ViewChild('ssid') ssid: ElementRef;
  @ViewChild('psk') psk: ElementRef;
  

  constructor( private api: ApiService , private modal : XgModalService) { }


  ngOnInit() {           
    this.readAll();
  }

  readAll(){
    this.readNetFileFormat();
    this.readWifiFileFormat();
    this.scanWifi();      
  }



  //네트워크 파일 정보 조회 
  readNetFileFormat(){
    
    this.subscA && this.subscA.unsubscribe();
    this.subscA =  this.api.getNetworkFileFmt().subscribe(response => {

      if (response['rcd'] === 0) {
        this.netFile = response['data'];  
        
        this.setNetInputs();
        this.setWifiInputs();
      } 
    }, error => {
      console.log(error);
    });

    
  }


  //WIFI 파일 정보 조회 
  readWifiFileFormat(){
  
    this.subscB && this.subscB.unsubscribe();
    this.subscB =  this.api.getWifiFileFmt().subscribe(response => {

      if (response['rcd'] === 0) {
        this.wifiFile = response['data'];
        this.setWifiInputs();
        
      } 
    }, error => {
      console.log(error);
    });    
    
  }


  scanWifi(){
   //와이파이 스캔 목록
   this.subscE && this.subscE.unsubscribe();
   this.subscE = this.api.getWifiScan().subscribe(response => {

     if (response['rcd'] === 0) {
       this.wifi_scan_list = response['data'];      
     } 
   }, error => {
     console.log(error);
   });
  }


  saveAll(){

   
    
    if( this.netFile.e_yn == "1" ){
      if( this.netFile.e_addr.trim() == "" || this.netFile.e_gate.trim() == "" || this.netFile.e_mask.trim() == "" )
      {
        this.modal.alert("입력확인",  "유선네트워크 항목을 입력하세요");
        return;
      }
    }

    if( this.netFile.w_yn == "1" ){
      if( this.netFile.w_addr.trim() == "" || this.netFile.w_gate.trim() == "" || this.netFile.w_mask.trim() == ""
      || this.wifiFile.ssid.trim() == "" || this.wifiFile.psk.trim() == "" )     
      {
        this.modal.alert("입력확인",  "무선네트워크 항목을 입력하세요");
        return;
      }
    }

  

    const initialState = {      
      title : "확인", 
      message  : "네트워크 설정을 저장 하시겠습니까?" ,
      confirmBtnName : "저장",
      declineBtnName : "취소"
    };
    
    
    this.modal.openConfirm(initialState).then(  async success => {   
      try {
        let resNetfile =  await (await this.saveNetwork()).toPromise();
        if (resNetfile['rcd'] != 0) {
          throw new Error("Network 파일 저장 오류");
        }        

        let resWififile =  await (await this.saveWifi()).toPromise();
        if (resWififile['rcd'] != 0) {
          throw new Error("Wifi 파일  저장 오류");
        }

        this.modal.alert("확인",  "저장되었습니다." );
        this.readAll();

      }
      catch( err ){
        
        this.modal.alert("저장실패",  err.message );
      }

     
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });

  }

  
  async saveNetwork(){                 
    console.log(this.netFile);
    return this.api.saveNetworkFileFmt( this.netFile );    
  }


  async saveWifi(){                 
    
    this.wifiFile.psk =  this.psk.nativeElement.value;
    console.log(this.wifiFile);
    
    return this.api.saveWifiFileFmt(  this.wifiFile );    
  }



  restartNetwork(){
    const initialState = {      
      title : "확인", 
      message  : "네트워크를 재시작 하겠습니까? " ,
      confirmBtnName : "재시작",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {      
              
      
      //네트워크 재시작
      this.subscC && this.subscC.unsubscribe();
      this.subscC =  this.api.restartNetwork().subscribe(response => {

        if (response['rcd'] === 0) {
          this.modal.alert("성공",  "Gateway 네트워크 재시작 되었습니다." );  
        } else {
          this.modal.alert("실패",  "네트워크 재시작 실패-A" );
        }
      }, error => {
        this.modal.alert("실패",  "네트워크 재시작을 실패-B" );
      });
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });
  }




  
  reboot(){
    const initialState = {      
      title : "확인", 
      message  : "Gateway를 재부팅 하시겠습니까?" ,
      confirmBtnName : "재시작",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {      

      this.subscD && this.subscD.unsubscribe();
      this.subscD =  this.api.reboot().subscribe(response => {

        if (response['rcd'] === 0) {
          this.modal.alert("성공",  "리부팅중 1분정도 소요됩니다." );  
        } else {
          this.modal.alert("실패",  "리부팅을 실패 했습니다.-A" );
        }
      }, error => {
        this.modal.alert("실패",  "리부팅을 실패 했습니다.-B" );
      });
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });
  }

  onClickWifiUseYN(){
    if ( this.netFile.w_yn == "1" )  {
      this.netFile.w_yn = "0";
      this.netFile.e_yn = "1";
    }
    else{
      this.netFile.w_yn = "1";
      this.netFile.e_yn = "0";
    }

    this.setNetInputs();
    this.setWifiInputs();
  }

  setWifiInputs(){      
    if( this.netFile.w_yn == "1" ) {
      this.w_addr.nativeElement.removeAttribute("readonly",);
      this.w_gate.nativeElement.removeAttribute("readonly");      
      this.w_mask.nativeElement.removeAttribute("readonly");
      this.psk.nativeElement.removeAttribute("readonly");

    }else {
      this.w_addr.nativeElement.setAttribute("readonly", true);
      this.w_gate.nativeElement.setAttribute("readonly", true);      
      this.w_mask.nativeElement.setAttribute("readonly", true);
      this.psk.nativeElement.setAttribute("readonly", true);
      
      this.netFile.w_addr = "";
      this.netFile.w_gate = "";
      this.netFile.w_mask = "";

      this.wifiFile.ssid = "";
      this.wifiFile.psk = "";
      this.wifiFile.key_mgmt = "WPA-PSK";      
    }
  }


  onClickNetUseYN() {
    if ( this.netFile.e_yn == "1" )  
    {
      this.netFile.e_yn = "0";
      this.netFile.w_yn = "1";
    }
    else
    {
      this.netFile.e_yn = "1";
      this.netFile.w_yn = "0";
    }

    this.setNetInputs();
    this.setWifiInputs();
  }


  setNetInputs(){
    if( this.netFile.e_yn == "1"  ) {
      this.e_addr.nativeElement.removeAttribute("readonly",);
      this.e_gate.nativeElement.removeAttribute("readonly");      
      this.e_mask.nativeElement.removeAttribute("readonly");

    }else {
      this.e_addr.nativeElement.setAttribute("readonly", true);
      this.e_gate.nativeElement.setAttribute("readonly", true);      
      this.e_mask.nativeElement.setAttribute("readonly", true);

      this.netFile.e_addr = "";
      this.netFile.e_gate = "";
      this.netFile.e_mask = "";
    }
  }


  onClickSSID(item){
    console.log(item);    
    this.wifiFile.ssid = item.ssid ;
  }

}
