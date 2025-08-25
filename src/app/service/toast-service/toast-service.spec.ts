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

    tick(duration); // Avança o tempo em 1000ms

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
});