import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-control-plug',
  templateUrl: './control-plug.component.html',
  styleUrls: ['./control-plug.component.scss']
})
export class ControlPlugComponent implements OnInit {

  private timer1: any;
  plugs = [];
  
  constructor(private api: ApiService) {
  }

  ngOnInit() {        
    this.timer1 = setInterval(() => { this.updateData(); }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer1);
  }

  trackPlug(index, item) {
    return item.ZB_ADDR;
  }

  updateData() {

    let tmp = Object.assign([], this.api.plugs);

    tmp.forEach(item => {
      item['ICON'] = 'assets/purple/icon_tellar.png';
    })

    for (let i = tmp.length; i < 12; i++) {
      tmp.push({ ZB_ADDR: '', DEV_ST: 9, SW_ST: 0 });
    }
    this.plugs = tmp;
  }
  
}
