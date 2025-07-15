import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestCard } from './latest-card';

describe('LatestCard', () => {
  let component: LatestCard;
  let fixture: ComponentFixture<LatestCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
