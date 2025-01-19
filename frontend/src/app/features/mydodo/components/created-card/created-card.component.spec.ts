import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedCardComponent } from './created-card.component';

describe('CreatedCardComponent', () => {
  let component: CreatedCardComponent;
  let fixture: ComponentFixture<CreatedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatedCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
