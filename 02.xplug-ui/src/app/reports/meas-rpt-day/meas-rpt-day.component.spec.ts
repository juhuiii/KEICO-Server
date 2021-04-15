import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasRptDayComponent } from './meas-rpt-day.component';

describe('MeasRptDayComponent', () => {
  let component: MeasRptDayComponent;
  let fixture: ComponentFixture<MeasRptDayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasRptDayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasRptDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
