import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModTrendComponent } from './mod-trend.component';

describe('ModTrendComponent', () => {
  let component: ModTrendComponent;
  let fixture: ComponentFixture<ModTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
