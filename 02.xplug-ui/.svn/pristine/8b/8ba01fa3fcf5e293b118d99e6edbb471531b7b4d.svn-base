import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slide } from 'ngx-router-animations';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *',
        useAnimation(slide, {
          params: {enterTiming: '1', leaveTiming: '1', enterDelay: '0.1', leaveDelay: '0.1'}
        }))])
  ]  
})
export class SettingsComponent implements OnInit {

  constructor() { 
    console.log("SettingsComponent::constructor()");
  }

  ngOnInit() {
    console.log("SettingsComponent::ngOnInit()");
  } 

  getSize() {
    return $('#page').width();
  }

  getState(outlet) {
    return outlet.activatedRouteData.state;
  }
}
