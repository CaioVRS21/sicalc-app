import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainer } from './toast-container';
import { ToastService } from '../service/toast-service/toast-service';
import { By } from '@angular/platform-browser';

describe('ToastContainer', () => {
  let component: ToastContainer;
  let fixture: ComponentFixture<ToastContainer>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainer],
      providers: [ToastService]  
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastContainer);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService); 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a toast when the service emits one', () => {
    toastService.success('Test success message');
    fixture.detectChanges(); 

    const toastElement = fixture.nativeElement.querySelector('.bg-green-600');
    expect(toastElement).toBeTruthy();
    expect(toastElement.textContent).toContain('Test success message');
  });

  it('should display multiple toasts', () => {
    toastService.success('First');
    toastService.error('Second');
    fixture.detectChanges();

    const toastElements = fixture.nativeElement.querySelectorAll('[role="status"]');
    expect(toastElements.length).toBe(2);
    expect(toastElements[0].textContent).toContain('First');
    expect(toastElements[1].textContent).toContain('Second');
  });

  it('should call dismiss on the service when the close button is clicked', () => {
    const dismissSpy = jest.spyOn(toastService, 'dismiss'); // não chame mockRestore() aqui
    toastService.info('A toast to dismiss');
    fixture.detectChanges();

    
    const closeButton = fixture.debugElement.query(By.css('button'));
    closeButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(dismissSpy).toHaveBeenCalled();
    
    // Verifica se o toast foi removido do DOM
    const toastElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(toastElement).toBeFalsy();
  });

  it('should not render any toasts if the service has none', () => {
    const toastElements = fixture.nativeElement.querySelectorAll('[role="status"]');
    expect(toastElements.length).toBe(0);
  });
});