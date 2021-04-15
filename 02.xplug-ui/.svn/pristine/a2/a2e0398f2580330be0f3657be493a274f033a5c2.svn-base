import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-progrss',
  templateUrl: './modal-progrss.component.html',
  styleUrls: ['./modal-progrss.component.scss']
})
export class ModalProgrssComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) { 

  }
  
  public remainTime : number  = 0;

  ngOnInit() 
  { 

    if( typeof this["showTimeout"] === 'number' && this["showTimeout"] > 0 )
    {      
      this.remainTime = this["showTimeout"];
      setTimeout(()=>{this.countDown()}, 1000);
    }    

  }

  countDown()
  { 
    this.remainTime--;    
    if ( this.remainTime <= 0 )
    {
      this.close();
      return;
    }

    setTimeout(()=>{this.countDown()}, 1000);
  }
 
  close() {
    console.log(this.bsModalRef.content);
    this.bsModalRef.content["result"] = true;
    this.bsModalRef.hide()
  }

}
