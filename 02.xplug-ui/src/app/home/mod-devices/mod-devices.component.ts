import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-mod-devices',
  templateUrl: './mod-devices.component.html',
  styleUrls: ['./mod-devices.component.scss']
})
export class ModDevicesComponent implements OnInit {

  cnt_total = 0;
  cnt_on    = 0;
  cnt_off   = 0;
  cnt_warr  = 0;
  cnt_atm   = 0;
  cnt_all_deny = 0; //전체제어 거부 

  tm_off = "";
  tm_on = "";
  
  
  private timer1: any;
  private timer2: any;

  constructor(public api: ApiService) { }

  ngOnInit() {
    setTimeout( () => { this.init(); }, 1000 );
  }

  ngOnDestroy() {
    clearInterval(this.timer1);
    clearInterval(this.timer2);
  }

  init() {
    this.getCount();
    this.getSchd();
    this.timer1 = setInterval(() => { this.getCount(); }, 1000);
    this.timer2 = setInterval(() => { this.getSchd(); }, 5000);
  }


  getCount() {

    let _cnt_total = 0;
    let _cnt_on    = 0;
    let _cnt_off   = 0;
    let _cnt_warr  = 0;
    let _cnt_atm   = 0;
    let _cnt_all_deny = 0;

    let plugs = this.api.getPlugs();

    plugs.forEach( item => {
      _cnt_total++;

      if( item.DEV_ST != 1 ) {
        _cnt_warr++;
      }
      else
      if( item.SW_ST == 1 ) {
        _cnt_on++;
      }
      else {
        _cnt_off++;
      }

      //  ATM 기기
      if( item.DEV_GB == 999 ) {
        _cnt_atm++;
      }

      if( item.MANU_CTL_ALLOW != '1' ){
        _cnt_all_deny++;
      }

    });

    this.cnt_total = _cnt_total ;
    this.cnt_on    = _cnt_on    ;
    this.cnt_off   = _cnt_off   ;
    this.cnt_warr  = _cnt_warr  ;
    this.cnt_atm   = _cnt_atm   ;
    this.cnt_all_deny = _cnt_all_deny;
  }

  getSchd() {

    this.api.getAtmSchd().subscribe( response => {

      if( response['rcd'] === 0 ) {

        let tmp = response['data'];
        tmp.forEach( item => {

          if( item.CTL_CMD == 0 ) {
            this.tm_off = moment(item.CTL_TIME, "Hmm").format("HH:mm");
          }
          else
          if( item.CTL_CMD == 1 ) {
            this.tm_on = moment(item.CTL_TIME, "Hmm").format("HH:mm");
          }
        });
      }
      else {
        console.log( 'atm schd error : ', response );
      }

    }, error => {

      console.log( error );

    });

  }


}
