import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasPlugsComponent } from './meas-plugs.component';

describe('MeasPlugsComponent', () => {
  let component: MeasPlugsComponent;
  let fixture: ComponentFixture<MeasPlugsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasPlugsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasPlugsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
