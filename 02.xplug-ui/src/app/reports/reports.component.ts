import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slide } from 'ngx-router-animations';
import * as moment from 'moment';
 
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *',
        useAnimation(slide, {
          params: {enterTiming: '1', leaveTiming: '1', enterDelay: '0.1', leaveDelay: '0.1'}
        }))])
  ]
})
export class ReportsComponent implements OnInit {

  public result: [];

  constructor(private api: ApiService) {
  }

  ngOnInit() {
  }
  
  getState(outlet) {
    return outlet.activatedRouteData.state;
  }
}
