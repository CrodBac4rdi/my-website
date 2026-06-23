export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type ToastHandler = (item: ToastItem) => void;

let _handler: ToastHandler | null = null;

export function registerToastHandler(fn: ToastHandler) {
  _handler = fn;
}

export function unregisterToastHandler() {
  _handler = null;
}

function show(message: string, type: ToastType) {
  _handler?.({ id: crypto.randomUUID(), message, type });
}

export const toast = {
  success: (message: string) => show(message, 'success'),
  error:   (message: string) => show(message, 'error'),
  info:    (message: string) => show(message, 'info'),
};
