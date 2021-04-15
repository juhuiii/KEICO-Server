import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-rept-switch',
  templateUrl: './rept-switch.component.html',
  styleUrls: ['./rept-switch.component.scss']
})
export class ReptSwitchComponent implements OnInit {

  txdate = moment().format("YYYY-MM-DD");
  reports = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.updateData();
  }

  gotoPrev() {
    this.txdate = moment(this.txdate).add(-1, 'days').format("YYYY-MM-DD");
    this.updateData();
  }

  gotoToday() {
    this.txdate = moment().format("YYYY-MM-DD");
    this.updateData();
  }

  gotoNext() {
    this.txdate = moment(this.txdate).add(1, 'days').format("YYYY-MM-DD");
    this.updateData();
  }
    
  trackIndex(index, item) {
    return index;
  }
  
  updateData() {

    let fr_date = moment(this.txdate).format("YYYYMMDD");
    let to_date = moment(this.txdate).format("YYYYMMDD");


    this.api.getReportSwEvnt(fr_date, to_date).subscribe(response => {

      if (response['rcd'] === 0) {
        let tmp = response['data'];
        tmp.forEach(item => {
          let atDate = item['TX_DT']
          let atTime = ( item['TX_TM'] + "").padStart(6,"0");
          item['TXDATE'] = moment( atDate + atTime , 'YYYYMMDDhhmmss');
        });
        this.reports = tmp;
      }
 
    }, error => {
      console.log(error);
    });
  }

}
