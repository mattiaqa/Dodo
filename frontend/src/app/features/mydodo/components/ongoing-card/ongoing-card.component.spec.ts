import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingCardComponent } from './ongoing-card.component';

describe('OngoingCardComponent', () => {
  let component: OngoingCardComponent;
  let fixture: ComponentFixture<OngoingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngoingCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OngoingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
