import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-meas-rpt-mon',
  templateUrl: './meas-rpt-mon.component.html',
  styleUrls: ['./meas-rpt-mon.component.scss']
})
export class MeasRptMonComponent implements OnInit {

  

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

    let fr_mon = moment(this.txdate).add(-12, 'months').format("YYYYMM");
    let to_mon = moment(this.txdate).format("YYYYMM");

    this.api.getReportMonTotal(fr_mon, to_mon).subscribe(response => {

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
