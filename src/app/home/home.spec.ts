// @jest-environment jsdom
/// <reference types="jest" />
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

const createActivatedRouteMock = (params: Record<string, any> = {}, queryParams: Record<string, any> = {}, snapshotParams: Record<string, any> = {}) => ({
  snapshot: { paramMap: convertToParamMap(snapshotParams) },
  params: of(params),
  queryParams: of(queryParams),
});

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  async function setup(routeMock = createActivatedRouteMock()) {
    // Reset the TestBed so setup() can be called multiple times safely
    // (e.g. once in beforeEach and again inside a specific test with a different route mock)
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: routeMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('route parameters', () => {
    test('works with provided route params', async () => {
      const routeMock = createActivatedRouteMock({ id: '123' }, { q: 'a' }, { id: '123' });
      await setup(routeMock);

      expect(component).toBeTruthy();
    });
  });
});
