import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReptSchdComponent } from './rept-schd.component';

describe('ReptSchdComponent', () => {
  let component: ReptSchdComponent;
  let fixture: ComponentFixture<ReptSchdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReptSchdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReptSchdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
