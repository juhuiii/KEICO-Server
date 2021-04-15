import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-add-group',
  templateUrl: './modal-add-group.component.html',
  styleUrls: ['./modal-add-group.component.scss']
})
export class ModalAddGroupComponent implements OnInit {
  @ViewChild("INPUT_GRP_NM") inputGrpName : ElementRef;
  
  public onClose: Subject<Object>;

  public GRP_NM : string = "" ;
  public validate=true;
  public inputFocused=true;

  constructor(public bsModalRef: BsModalRef, public renderer: Renderer) { }


  ngOnInit() {
    this.onClose = new Subject();
    
    this.inputGrpName.nativeElement.focus();

    setTimeout(() => {        
        this.inputGrpName.nativeElement.focus();        
        this.inputGrpName.nativeElement.click();
      
    }, 500);
    
  }

  save() {
    if( this.GRP_NM.trim().length <= 0 ) 
    {
      this.validate = false;
      return;
    }
    this.validate = true;    

    this.onClose.next({ result : true , GRP_NM : this.GRP_NM } );
    this.bsModalRef.hide()
  }

  cancle() {
    this.onClose.next({ result : false , GRP_NM : this.GRP_NM });

    this.bsModalRef.hide();
  }

}
