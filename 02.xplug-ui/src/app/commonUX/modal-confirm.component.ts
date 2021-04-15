import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent implements OnInit {

  public onClose: Subject<number>;

  constructor(public bsModalRef: BsModalRef) { 
    
  }

  ngOnInit() {
    this.onClose = new Subject();    
  }

  onConfirm() {
    this.bsModalRef.content["result"] = true;
    this.onClose.next(1);
    this.bsModalRef.hide()
  }

  onIgnore() {
    this.bsModalRef.content["result"] = true;
    this.onClose.next(2);
    this.bsModalRef.hide()
  }

  onCancel() {
    this.bsModalRef.content["result"] = false;
    this.onClose.next(9);
    this.bsModalRef.hide();
  }
}
