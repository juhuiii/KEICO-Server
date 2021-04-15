import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlPlugComponent } from './control-plug.component';

describe('ControlPlugComponent', () => {
  let component: ControlPlugComponent;
  let fixture: ComponentFixture<ControlPlugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlPlugComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlPlugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
