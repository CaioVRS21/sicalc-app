import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, Toast } from './toast-service';
import { first } from 'rxjs/operators';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a success toast and emit it', (done) => {
    const message = 'Success!';
    service.toasts$.pipe(first(toasts => toasts.length > 0)).subscribe(toasts => {
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe(message);
      expect(toasts[0].type).toBe('success');
      done();
    });

    service.success(message);
  });

  it('should add an error toast and emit it', (done) => {
    const message = 'Error!';
    service.toasts$.pipe(first(toasts => toasts.length > 0)).subscribe(toasts => {
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe(message);
      expect(toasts[0].type).toBe('error');
      done();
    });

    service.error(message);
  });

  it('should remove a toast after its duration has passed', fakeAsync(() => {
    const duration = 1000;
    service.success('Temporary toast', duration);

    let toasts: Toast[] = [];
    service.toasts$.subscribe(t => toasts = t);

    expect(toasts.length).toBe(1);

    tick(duration); 

    expect(toasts.length).toBe(0);
  }));

  it('should remove a specific toast when dismiss() is called', (done) => {
    service.success('Toast 1');
    service.error('Toast 2');

    let toastIdToDismiss: number;

    service.toasts$.pipe(first(toasts => toasts.length === 2)).subscribe(toasts => {
      toastIdToDismiss = toasts[0].id;
      service.dismiss(toastIdToDismiss);
    });

    service.toasts$.pipe(first(toasts => toasts.length === 1)).subscribe(toasts => {
      expect(toasts.length).toBe(1);
      expect(toasts[0].id).not.toBe(toastIdToDismiss);
      expect(toasts[0].type).toBe('error');
      done();
    });
  });

  // Novos testes Jest
  it('should auto-dismiss toasts after their default durations (using jest timers)', () => {
    jest.useFakeTimers();

    let toasts: Toast[] = [];
    const sub = service.toasts$.subscribe(t => (toasts = t));

    // success -> 3000
    service.success('suc');
    expect(toasts.length).toBe(1);
    jest.advanceTimersByTime(2999);
    expect(toasts.length).toBe(1);
    jest.advanceTimersByTime(1);
    expect(toasts.length).toBe(0);

    // error -> 4000
    service.error('err');
    expect(toasts.length).toBe(1);
    jest.advanceTimersByTime(3999);
    expect(toasts.length).toBe(1);
    jest.advanceTimersByTime(1);
    expect(toasts.length).toBe(0);

    // info -> 3000
    service.info('inf');
    expect(toasts.length).toBe(1);
    jest.advanceTimersByTime(3000);
    expect(toasts.length).toBe(0);

    // warning -> 3500
    service.warning('warn');
    expect(toasts.length).toBe(1);
    jest.advanceTimersByTime(3500);
    expect(toasts.length).toBe(0);

    sub.unsubscribe();
    jest.useRealTimers();
  });

  it('should generate deterministic id when Date.now and Math.random are mocked', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
    const rndSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    let toasts: Toast[] = [];
    const sub = service.toasts$.subscribe(t => (toasts = t));

    service.success('det');
    expect(toasts.length).toBe(1);
    expect(toasts[0].id).toBeCloseTo(1000 + 0.5);

    sub.unsubscribe();
    dateSpy.mockRestore();
    rndSpy.mockRestore();
  });

  it('dismiss should remove the specific toast when multiple exist', () => {
    jest.useFakeTimers();

    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(2000);
    const rndSpy = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2);

    let toasts: Toast[] = [];
    const sub = service.toasts$.subscribe(t => (toasts = t));

    service.success('one');
    service.error('two');

    expect(toasts.length).toBe(2);
    const firstId = toasts[0].id;

    service.dismiss(firstId);
    expect(toasts.length).toBe(1);
    expect(toasts[0].id).not.toBe(firstId);

    sub.unsubscribe();
    dateSpy.mockRestore();
    rndSpy.mockRestore();
    jest.useRealTimers();
  });
});