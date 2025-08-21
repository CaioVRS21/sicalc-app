import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';


@Component({ selector: 'router-outlet', template: '' })
class RouterOutletStub {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterOutletStub],
      providers: [],
      declarations: [], 
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the correct title signal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title()).toBe('sicalc-app'); 
  });
});
