import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedTopicsComponent } from './recommended-topics.component';

describe('RecommendedTopicsComponent', () => {
  let component: RecommendedTopicsComponent;
  let fixture: ComponentFixture<RecommendedTopicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedTopicsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecommendedTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
