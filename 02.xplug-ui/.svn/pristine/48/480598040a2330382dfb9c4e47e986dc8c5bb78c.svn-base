import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss']
})
export class BarchartComponent implements OnInit {

  @Input() value = 0;
  @Input() max   = 0;
  @Input() label = "";
  @Input() background = 0;
  
  public percent = 0;
  public y2 = 0;

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if( this.value === 0 ) {
      this.percent = 0;
      this.y2 = 90;
      return;
    }

    if( this.max === 0 ) {
      this.percent = 0;
      this.y2 = 90;
      return;
    }

    if( this.background !== 0 ) {
      this.percent = 0;
      this.y2 = 90 - this.max * 0.2;
      return;
    }

    this.percent = this.value / this.max * 100.0;

    if( this.percent > 100 ) this.percent = 100;
    if( this.percent < 0 ) this.percent = 0;

    this.y2 = 90 - (80 * this.percent / 100.0);
  }

}
