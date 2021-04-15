import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-meas-plugs',
  templateUrl: './meas-plugs.component.html',
  styleUrls: ['./meas-plugs.component.scss']
})
export class MeasPlugsComponent implements OnInit, OnDestroy {

  public onCnt = 0;
  public offCnt = 0;
  public totKw  = 0;
  plugs = [];
  timer1: any;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.init();
    // setTimeout( () => { this.init(); }, 1000 );
  }

  init() {
    this.updateData();
    this.timer1 = setInterval(() => { this.updateData(); }, 1000);
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

  updateData() {
    this.plugs = this.api.getPlugs();

    this.onCnt = 0;
    this.offCnt = 0;
    this.totKw = 0;
    this.plugs.forEach( item => {

      this.totKw += item.KW;
      if( item.SW_ST == 1 ) this.onCnt++;
      else                  this.offCnt++;
    });
  }

}
