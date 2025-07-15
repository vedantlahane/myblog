import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingCard } from './trending-card';

describe('TrendingCard', () => {
  let component: TrendingCard;
  let fixture: ComponentFixture<TrendingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
