import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartecipatedCardComponent } from './partecipated-card.component';

describe('PartecipatedCardComponent', () => {
  let component: PartecipatedCardComponent;
  let fixture: ComponentFixture<PartecipatedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartecipatedCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartecipatedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
