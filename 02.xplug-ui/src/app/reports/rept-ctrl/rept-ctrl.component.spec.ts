import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReptCtrlComponent } from './rept-ctrl.component';

describe('ReptCtrlComponent', () => {
  let component: ReptCtrlComponent;
  let fixture: ComponentFixture<ReptCtrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReptCtrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReptCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
