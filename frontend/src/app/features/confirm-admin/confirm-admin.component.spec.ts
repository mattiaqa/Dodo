import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAdminComponent } from './confirm-admin.component';

describe('ConfirmAdminComponent', () => {
  let component: ConfirmAdminComponent;
  let fixture: ComponentFixture<ConfirmAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
