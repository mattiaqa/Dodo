import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationConfirmComponent } from './registration-confirm.component';

describe('RegistrationConfirmComponent', () => {
  let component: RegistrationConfirmComponent;
  let fixture: ComponentFixture<RegistrationConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
