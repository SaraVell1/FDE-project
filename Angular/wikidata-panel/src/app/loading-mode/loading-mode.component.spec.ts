import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingModeComponent } from './loading-mode.component';

describe('LoadingModeComponent', () => {
  let component: LoadingModeComponent;
  let fixture: ComponentFixture<LoadingModeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingModeComponent]
    });
    fixture = TestBed.createComponent(LoadingModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
