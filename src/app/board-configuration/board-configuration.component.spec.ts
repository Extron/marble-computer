import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardConfigurationComponent } from './board-configuration.component';

describe('BoardConfigurationComponent', () => {
  let component: BoardConfigurationComponent;
  let fixture: ComponentFixture<BoardConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
