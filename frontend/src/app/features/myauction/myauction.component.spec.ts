import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyauctionComponent } from './myauction.component';

describe('MyauctionComponent', () => {
  let component: MyauctionComponent;
  let fixture: ComponentFixture<MyauctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyauctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyauctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
