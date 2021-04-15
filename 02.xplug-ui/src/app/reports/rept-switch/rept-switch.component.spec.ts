import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReptSwitchComponent } from './rept-switch.component';

describe('ReptSwitchComponent', () => {
  let component: ReptSwitchComponent;
  let fixture: ComponentFixture<ReptSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReptSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReptSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
