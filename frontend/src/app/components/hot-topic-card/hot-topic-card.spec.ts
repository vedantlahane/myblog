import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotTopicCard } from './hot-topic-card';

describe('HotTopicCard', () => {
  let component: HotTopicCard;
  let fixture: ComponentFixture<HotTopicCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotTopicCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotTopicCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
