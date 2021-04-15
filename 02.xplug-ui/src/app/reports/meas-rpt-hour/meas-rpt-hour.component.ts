import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-meas-rpt-hour',
  templateUrl: './meas-rpt-hour.component.html',
  styleUrls: ['./meas-rpt-hour.component.scss']
})
export class MeasRptHourComponent implements OnInit {

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


    this.api.getReportHourTotal(fr_date, to_date).subscribe(response => {

      if (response['rcd'] === 0) {
        let tmp = response['data'];
        tmp.forEach(item => {
          item['TXDATE'] = moment( item['TX_DT'], 'YYYYMMDD');
        });
        this.reports = tmp;
      }
 
    }, error => {
      console.log(error);
    });
  }

}
