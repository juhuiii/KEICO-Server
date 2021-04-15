import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetHolidaysComponent } from './set-holidays.component';

describe('SetHolidaysComponent', () => {
  let component: SetHolidaysComponent;
  let fixture: ComponentFixture<SetHolidaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetHolidaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
