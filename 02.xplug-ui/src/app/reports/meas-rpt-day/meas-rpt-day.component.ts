import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-meas-rpt-day',
  templateUrl: './meas-rpt-day.component.html',
  styleUrls: ['./meas-rpt-day.component.scss']
})
export class MeasRptDayComponent implements OnInit {

  txdate = moment().format("YYYY-MM-DD");
  reports = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.updateData();
  }
    
  trackIndex(index, item) {
    return index;
  }
  
  updateData() {

    let fr_date = moment(this.txdate).add(-30, 'days').format("YYYYMMDD");
    let to_date = moment(this.txdate).format("YYYYMMDD");

    this.api.getReportDayTotal(fr_date, to_date).subscribe(response => {

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
