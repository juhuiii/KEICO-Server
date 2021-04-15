import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-bottom',
  templateUrl: './admin-bottom.component.html',
  styleUrls: ['./admin-bottom.component.scss']
})
export class AdminBottomComponent implements OnInit {

  public   now:string = "";
  constructor() { }

  ngOnInit() {
    this.updateTime();
    setInterval(() => { this.updateTime(); }, 1000 );
  }

  updateTime() {
    this.now = moment().format("YYYY-MM-DD HH:mm:ss");   
  }

}
