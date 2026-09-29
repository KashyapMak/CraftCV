import { Buffer } from 'buffer';
import EventEmitter from 'events';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure browser global, Buffer, and EventEmitter support
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
  (window as any).EventEmitter = EventEmitter;
  (window as any).process = (window as any).process || { env: {} };
}

createRoot(document.getElementById('root')!).render(<App />);
