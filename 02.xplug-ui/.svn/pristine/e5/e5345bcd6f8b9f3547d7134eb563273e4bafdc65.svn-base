import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-add-holiday',
  templateUrl: './modal-add-holiday.component.html',
  styleUrls: ['./modal-add-holiday.component.sass']
})
export class ModalAddHolidayComponent implements OnInit {
  
  @ViewChild("INPUT_HOLI_NM") inputHoliName : ElementRef;
  @ViewChild("INPUT_HOLI_DT") inputHoliDate : ElementRef;

  public onClose: Subject<Object>;

  public HOLI_NM = '' ;
  public HOLI_DT = '' ;

  public validate_nm = true;
  public validate_dt = true;

  constructor( public bsModalRef: BsModalRef, public renderer: Renderer)  { 
    console.log( bsModalRef );
  }

  ngOnInit() {

    this.onClose = new Subject();
    
    this.inputHoliName.nativeElement.focus();

    setTimeout(() => {        
        this.inputHoliName.nativeElement.focus();        
        this.inputHoliName.nativeElement.click();      
    }, 500);
  }


  
  save() {
    if( this.HOLI_NM.trim().length <= 0 ) 
    {
      this.validate_nm = false;
      return;
    }

    if( this.HOLI_DT.trim().length <= 0 ) 
    {
      this.validate_dt = false;
      return;
    }


    this.validate_nm = true;    
    this.validate_dt = true;    

    this.onClose.next({ result : true , HOLI_NM : this.HOLI_NM, HOLI_DT : this.HOLI_DT } );
    this.bsModalRef.hide()
  }

  cancle() {
    this.onClose.next({ result : false ,  HOLI_NM : this.HOLI_NM, HOLI_DT : this.HOLI_DT});

    this.bsModalRef.hide();
  }

}
