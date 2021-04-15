import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPlugsDetailComponent } from './set-plugs-detail.component';

describe('SetPlugsDetailComponent', () => {
  let component: SetPlugsDetailComponent;
  let fixture: ComponentFixture<SetPlugsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPlugsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPlugsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
