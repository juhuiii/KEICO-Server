import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import * as moment from 'moment';

@Component({
  selector: 'app-mod-btn-group',
  templateUrl: './mod-btn-group.component.html',
  styleUrls: ['./mod-btn-group.component.scss']
})
export class ModBtnGroupComponent implements OnInit {

  @Input() group;
  private timeout = 0;

  constructor(private api: ApiService, private modal: XgModalService, private spinner: Ng4LoadingSpinnerService) { }

  ngOnInit() {
  }

  onClick() {

    if (this.api.control == false) {
      this.modal.alert("알림", "시범운영 기간중에는 제어할 수 없습니다.");
      return;
    }

    //  비어있는 버튼은 SKIP
    if (this.group.GRP_ST === 9) {
      return;
    }

    if (this.group.CNT_TOT <= 0 ) {
      this.modal.alert("알림", "등록된 장비가 없어 제어할 수 없습니다.");
      return;
    }


    this.modal.confirmGroupOnOff(this.group['GRP_NM'], "").subscribe(result => {
      if (result === 'on') {
        this.controlSwitch('on', '');
      }
      if (result === 'off') {
        this.confirmPasswd();
      }
    });
  }

  //  OFF 시에만 체크
  confirmPasswd() {

    //  운영시간 체크
    let now = Number(moment().format("HHmm"));
    let isWorkTime = (now >= this.api.siteInfo.WORK_STM && now <= this.api.siteInfo.WORK_ETM);

    let comment = "운영자 비밀번호";
    if (isWorkTime) {
      comment = "관리자 비밀번호";
    }

    this.modal.confirmPass(comment, "").subscribe(result => {

      if (this.api.isEmpty(result))
        return;

      let pass = isWorkTime ? this.api.siteInfo['MNGR_PW'] : this.api.siteInfo['OPER_PW'];
      if (result !== pass) {
        this.modal.alert("알림", "입력하신 비밀번호가 맞지 않습니다.");
        return;
      }

      this.testPlug();
    });
  }

  testPlug() {
    //  대기전력 설정값 이상경우
    if (this.group.KW > this.group.STBY_KW && this.group.STBY_KW > 0) {

      this.modal.confirmSwitch("제어", "기기가 사용중입니다. 강제 또는 제외하고 OFF 하시겠읍니까?").subscribe(result => {

        //  Confirm : 제외
        if (result === 1)
          this.controlSwitch('off', 'y');
        else
          if (result === 2)
            this.controlSwitch('off', 'n');
      })
    }
    else {
      this.controlSwitch('off', 'y');
    }
  }

  controlSwitch(onoff, filter) {

    this.spinner.show();

    this.api.groupOnOff(this.group.GRP_SQ, onoff, filter).subscribe(data => {
      this.timeout = 0;
      setTimeout(() => { this.checkTimeout(onoff); }, 500);
    }, error => {
      console.log(error);
    });
  }

  checkTimeout(onoff) {

    if (onoff == 'off' && this.group.CNT_ON === 0) {
      this.spinner.hide();
      return;
    }
    else
    if (onoff == 'on' && this.group.CNT_OFF === 0) {
      this.spinner.hide();
      return;
    }

    if (this.timeout++ >= 5) {
      this.spinner.hide();
      return;
    }

    setTimeout(() => { this.checkTimeout(onoff); }, 500);
  }

}
