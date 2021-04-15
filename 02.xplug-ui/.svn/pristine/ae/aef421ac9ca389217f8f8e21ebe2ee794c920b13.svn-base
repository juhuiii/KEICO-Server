import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import * as moment from 'moment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-mod-control',
  templateUrl: './mod-control.component.html',
  styleUrls: ['./mod-control.component.scss']
})
export class ModControlComponent implements OnInit {

  constructor(private api: ApiService, private modal: XgModalService, private spinner: Ng4LoadingSpinnerService) { }

  private count = 0;

  ngOnInit() {
  }

  onClick_AllOn() {

    this.modal.confirmOnOff("제어", "기기를 ON 하시겠읍니까?").subscribe(result => {

      if (result === 1) {

        this.spinner.show();

        this.api.allOn().subscribe(response => {

          if (response['rcd'] !== 0) {
            this.spinner.hide();
            this.modal.alert("알림", response['rms']);
          }
          else {
            setTimeout(() => {
              this.spinner.hide();
              this.modal.alert("알림", "정상처리 되었습니다.");
            }, 4000);
          }

        }, error => {
          this.spinner.hide();
          this.modal.alert("알림", error['rms']);
        });
      }
    });
  }

  onClick_AllOff() {

    // OFF 시에만 체크
    // 운영시간 체크, 운영자 or 관리자 비번 
    let now = Number(moment().format("HHmm"));

    let isWorkTime = (now >= this.api.siteInfo.WORK_STM && now <= this.api.siteInfo.WORK_ETM);

    let comment = "운영자 비밀번호";
    if (isWorkTime) {
      comment = "관리자 비밀번호";
    }

    this.modal.confirmPass(comment, "").subscribe(result => {

      if (this.api.isEmpty(result)) {
        return;
      }

      let pass = this.api.siteInfo['OPER_PW'];
      if (isWorkTime) {
        pass = this.api.siteInfo['MNGR_PW'];
      }

      if (result !== pass) {
        this.modal.alert("알림", "입력하신 비밀번호가 맞지 않습니다.");
        return;
      }

      this.spinner.show();

      this.api.allOff('y').subscribe(response => {
        
        if (response['rcd'] !== 0) {
          this.spinner.hide();
          this.modal.alert("알림", response['rms']);
        }
        else {

          setTimeout(() => {
            this.spinner.hide();
            this.modal.alert("알림", "정상처리 되었습니다.");
          }, 4000);
        }

      }, error => {
        this.spinner.hide();
        this.modal.alert("알림", error.status + ":" + error.statusText);
      });

    });
  }
}
