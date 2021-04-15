import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-ctrl-group',
  templateUrl: './modal-ctrl-group.component.html',
  styleUrls: ['./modal-ctrl-group.component.scss']
})
export class ModalCtrlGroupComponent implements OnInit {

  public onClose: Subject<string>;

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  onClickOn() {
    this.onClose.next('on');
    this.bsModalRef.hide();
  }

  onClickOff() {
    this.onClose.next('off');
    this.bsModalRef.hide();
  }

  onClickClose() {
    this.onClose.next('cancel');
    this.bsModalRef.hide();
  }

}
