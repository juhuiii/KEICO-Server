import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiService } from '../services/api.service';
import * as $ from 'jquery';


@Component({
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent implements OnInit {

  private onClose: Subject<string>;

  constructor(private api: ApiService, public bsModalRef: BsModalRef) { 
  }

  ngOnInit() {
    this.onClose = new Subject();    
  }

  onConfirm() {
    let data = this.getInput();

    if( this.api.isEmpty(data) ) {
      return;
    }
    
    this.bsModalRef.content["result"] = true;
    this.onClose.next(data);
    this.bsModalRef.hide()
  }

  onCancel() {
    this.bsModalRef.content["result"] = false;
    this.onClose.next('');
    this.bsModalRef.hide();
  }

  getInput() : any {
    return $('#input').val();
  }

  onClick(c:string) {
    let str : any = this.getInput();

    if( c === 'c' ) {
      str = '';
    }
    else 
    if( c === 'b' ) {
      str = str.substr(0, str.length-1);
    }
    else 
    if( c === 'ok' ) {
      this.onConfirm();
      return;
    }
    else 
    if( c === 'cancel' ) {
      this.onCancel();
      return;
    }
    else {
      str = str + c;
    }

    $('#input').val(str);
  }
}
