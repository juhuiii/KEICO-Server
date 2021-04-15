import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slide } from 'ngx-router-animations';


@Component({
  selector: 'admin-app-root',
  templateUrl: './admin-app.component.html',
  styleUrls: ['./admin-app.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *',
        useAnimation(slide, {
          params: {enterTiming: '0.7', leaveTiming: '0.7', enterDelay: '0.1', leaveDelay: '0.1'}
        }))])
  ]
})
export class AdminAppComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getState(outlet) {
    return outlet.activatedRouteData.state;
  }

}
