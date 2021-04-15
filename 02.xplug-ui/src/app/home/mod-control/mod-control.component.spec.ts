import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModControlComponent } from './mod-control.component';

describe('ModControlComponent', () => {
  let component: ModControlComponent;
  let fixture: ComponentFixture<ModControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
