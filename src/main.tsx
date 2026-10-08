import { Buffer } from 'buffer';
import EventEmitter from 'events';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure browser global, Buffer, Blob own property, and EventEmitter support
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
  (window as any).EventEmitter = EventEmitter;
  (window as any).process = (window as any).process || { env: {} };

  if (!Object.prototype.hasOwnProperty.call(window, 'Blob') && typeof window.Blob !== 'undefined') {
    try {
      Object.defineProperty(window, 'Blob', {
        value: window.Blob,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      (window as any).Blob = window.Blob;
    }
  }
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).global = globalThis;
  if (!Object.prototype.hasOwnProperty.call(globalThis, 'Blob') && typeof globalThis.Blob !== 'undefined') {
    try {
      Object.defineProperty(globalThis, 'Blob', {
        value: globalThis.Blob,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      (globalThis as any).Blob = globalThis.Blob;
    }
  }
}

createRoot(document.getElementById('root')!).render(<App />);
