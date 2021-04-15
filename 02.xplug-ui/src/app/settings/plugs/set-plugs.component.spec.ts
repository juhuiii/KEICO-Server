import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPlugsComponent } from './set-plugs.component';

describe('SetPlugsComponent', () => {
  let component: SetPlugsComponent;
  let fixture: ComponentFixture<SetPlugsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPlugsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPlugsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
