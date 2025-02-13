import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogListingComponent } from './blog-listing.component';

describe('BlogListingComponent', () => {
  let component: BlogListingComponent;
  let fixture: ComponentFixture<BlogListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
