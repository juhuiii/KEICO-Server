import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestControlComponent } from './test-control.component';

describe('TestControlComponent', () => {
  let component: TestControlComponent;
  let fixture: ComponentFixture<TestControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
