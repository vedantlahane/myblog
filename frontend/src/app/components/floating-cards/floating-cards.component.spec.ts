import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingCardsComponent } from './floating-cards.component';

describe('FloatingCardsComponent', () => {
  let component: FloatingCardsComponent;
  let fixture: ComponentFixture<FloatingCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
