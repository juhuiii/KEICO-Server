import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-rept-ctrl',
  templateUrl: './rept-ctrl.component.html',
  styleUrls: ['./rept-ctrl.component.scss']
})
export class ReptCtrlComponent implements OnInit {

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

    this.api.getReportControl(fr_date, to_date).subscribe(response => {

      if (response['rcd'] === 0) {
        let tmp = response['data'];
        tmp.forEach(item => {
          
          let atDate = item['CTL_DT']
          let atTime = ( item['CTL_TM'] + "").padStart(6,"0");
          item['TXDATE'] = moment( atDate + atTime , 'YYYYMMDDhhmmss');
        });
        this.reports = tmp;
      }
 
    }, error => {
      console.log(error);
    });
  }

}
