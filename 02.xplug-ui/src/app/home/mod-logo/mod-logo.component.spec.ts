import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModLogoComponent } from './mod-logo.component';

describe('ModLogoComponent', () => {
  let component: ModLogoComponent;
  let fixture: ComponentFixture<ModLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
