import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';

import * as moment from 'moment';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-set-holidays',
  templateUrl: './set-holidays.component.html',
  styleUrls: ['./set-holidays.component.scss']
})
export class SetHolidaysComponent implements OnInit {

  list = [];

  constructor(private api: ApiService, public modal: XgModalService) { }

  ngOnInit() {
    this.onReload();
  }

  onReload() {

    console.log( 'reload' );

    this.api.getHolidays().subscribe( response => {
      this.list = response['data']; 
      console.log(this.list);

    }, error => {
      console.log( error );
    });
  }


  onAdd() {

    this.modal.openAddHoliday("공휴일등록", "").subscribe(result => {
     
      if (this.api.isEmpty(result) || this.api.isEmpty(result["result"]) )  return; 

      if( result["result"] )
      {
        let HOLI_DT =  (result["HOLI_DT"] + "").replace(/-/g, "");

        let nHoliday  = { HOLI_NM : result["HOLI_NM"] , HOLI_DT: HOLI_DT };
        
        console.log(nHoliday);

        this.api.addHoliday(nHoliday).subscribe( res => {                 
          this.onReload() ;          
        },
        err => {          
          this.modal.alert( "저장", "저장 되지 않았습니다. 관리자 문의 바랍니다." );
          console.log("Error occured");
        });                
      }
    });
  }


  onDelete(HOLI_DT)
  {    
    let HOLI_DT_STR = moment( HOLI_DT, 'YYYYMMDD').format("YYYY-MM-DD");
    console.log( HOLI_DT_STR );
    
    const initialState = {      
      title : "삭제", 
      message  : HOLI_DT_STR + " 를 삭제 하시겠습니까?" ,
      confirmBtnName : "삭제",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {   

      this.api.delHoliday(HOLI_DT).subscribe( res => {                 
        this.onReload() ;          
      },
      err => {          
        this.modal.alert( "삭제", "삭제 되지 않았습니다. 관리자 문의 바랍니다." );          
        console.log("Error occured");
      });
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });  
  }
}
