import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickableSpanComponent } from './clickable-span.component';

describe('ClickableSpanComponent', () => {
  let component: ClickableSpanComponent;
  let fixture: ComponentFixture<ClickableSpanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClickableSpanComponent]
    });
    fixture = TestBed.createComponent(ClickableSpanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
