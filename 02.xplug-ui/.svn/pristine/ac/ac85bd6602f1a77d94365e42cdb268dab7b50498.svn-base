import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import * as moment from 'moment';

@Component({
  selector: 'app-set-default',
  templateUrl: './set-default.component.html',
  styleUrls: ['./set-default.component.scss']
})
export class SetDefaultComponent implements OnInit {

  public site = {};

  constructor(private api: ApiService, public modal: XgModalService) { }

  ngOnInit() {      
    this.onReload();    
  }
  

  onSave() {
    
    this.site["WORK_STM"] = this.site["WORK_STM_STR"].replace(":", "");
    this.site["WORK_ETM"] = this.site["WORK_ETM_STR"].replace(":", "");
   
    this.api.updateSite(this.site).subscribe( res => {        

      this.modal.alert( "저장", "저장되었습니다." );

      this.api.reload();
    },
    err => {
      this.modal.alert( "저장", "저장 되지 않았습니다. 관리자 문의 바랍니다." );
      
      console.log("Error occured");
    }
  );

    console.log( this.site );
  }

  onReload()
  {
    this.site = Object.assign({}, this.api.siteInfo );    //Clone Object           
    
    let INS_DT_STR  = (this.site["INS_DT"] + "").padStart(8,'0');
    let WORK_STM = (this.site["WORK_STM"] + "").padStart(4,'0');
    let WORK_ETM = (this.site["WORK_ETM"] + "").padStart(4,'0');

    this.site["INS_DT_STR"]   = moment( INS_DT_STR, 'YYYYMMDD').format("YYYY-MM-DD");    
    this.site["WORK_STM_STR"] = moment( WORK_STM, 'hmm').format("HH:mm");
    this.site["WORK_ETM_STR"] = moment( WORK_ETM, 'hmm').format("HH:mm");  

    console.log( this.site );
  }
  
}
