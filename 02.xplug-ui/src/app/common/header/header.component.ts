import { Component, OnInit } from '@angular/core';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public api: ApiService, private modal: XgModalService) { }

  ngOnInit() {
  }

  onClick() {
    this.modal.alert("알림", "시범운영 기간중에는 설정을 변경할 수 없습니다.");
  }

}
