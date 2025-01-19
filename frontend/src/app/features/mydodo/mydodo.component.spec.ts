import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDodoComponent } from './mydodo.component';

describe('MyDodoComponent', () => {
  let component: MyDodoComponent;
  let fixture: ComponentFixture<MyDodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
