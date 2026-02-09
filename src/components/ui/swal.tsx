import Swal from 'sweetalert2';

export interface SwalOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  scrollbarPadding?: boolean;
  input?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
  inputOptions?: Record<string, string>;
  inputValue?: string;
}

export class SwalHelper {
  static success(options: SwalOptions = {}) {
    return Swal.fire({
      title: options.title || 'Success!',
      text: options.text || 'Operation completed successfully.',
      icon: 'success',
      scrollbarPadding: false,
      ...options
    });
  }

  static error(options: SwalOptions = {}) {
    return Swal.fire({
      title: options.title || 'Error!',
      text: options.text || 'An error occurred.',
      icon: 'error',
      scrollbarPadding: false,
      ...options
    });
  }

  static warning(options: SwalOptions = {}) {
    return Swal.fire({
      title: options.title || 'Warning!',
      text: options.text || 'Please check your input.',
      icon: 'warning',
      scrollbarPadding: false,
      ...options
    });
  }

  static info(options: SwalOptions = {}) {
    return Swal.fire({
      title: options.title || 'Info',
      text: options.text || 'Information',
      icon: 'info',
      scrollbarPadding: false,
      ...options
    });
  }

  static confirm(options: SwalOptions = {}) {
    return Swal.fire({
      title: options.title || 'Are you sure?',
      text: options.text || 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: options.confirmButtonText || 'Yes, proceed!',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      scrollbarPadding: false,
      ...options
    });
  }

  static delete(options: SwalOptions = {}) {
    return Swal.fire({
      title: options.title || 'Are you sure?',
      text: options.text || 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: options.confirmButtonText || 'Yes, delete it!',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      scrollbarPadding: false,
      ...options
    });
  }

  static custom(options: SwalOptions) {
    return Swal.fire({
      scrollbarPadding: false,
      ...options
    });
  }
}

export default SwalHelper; 