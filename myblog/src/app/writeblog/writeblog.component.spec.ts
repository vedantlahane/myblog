import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteblogComponent } from './writeblog.component';

describe('WriteblogComponent', () => {
  let component: WriteblogComponent;
  let fixture: ComponentFixture<WriteblogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteblogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WriteblogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
