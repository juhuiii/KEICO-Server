import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-mod-kwh',
  templateUrl: './mod-kwh.component.html',
  styleUrls: ['./mod-kwh.component.scss']
})
export class ModKwhComponent implements OnInit {

  private timer1: any;
  public CURR_SAVE = 0;
  public PREV_SAVE = 0;
  public MAX_SAVE = this.PREV_SAVE * 1.2;

  constructor(private api: ApiService) { }

  ngOnInit() {
    setTimeout(() => { this.init(); }, 1000);
  }

  init() {
    this.getKWH();
    this.timer1 = setInterval(() => { this.getKWH(); }, 5000);
  }

  ngOnDestroy() {
    clearInterval(this.timer1);
  }

  getKWH() {

    this.api.getSaveEng().subscribe(response => {

      if (response['rcd'] === 0) {

        let data = response['data'];
        let curr = 0;
        let prev = 0;
        let max  = 0;
        
        if (data.length > 0) {
          curr = data[0]['SAVE_KW'] * 0.001;
        }

        if (data.length > 1) {
          prev = data[1]['SAVE_KW'] * 0.001;
        }

        if( this.api.simulation) {
          curr = 123434 * 0.001;
          prev = 250367 * 0.001;  
        }

        max = Math.max( curr, prev ) * 1.2;
        max = Math.max( max, 100 );


        this.CURR_SAVE = curr;
        this.PREV_SAVE = prev;
        this.MAX_SAVE  = max;   
      }

    }, error => {
      console.log(error);
    });
  }

}
