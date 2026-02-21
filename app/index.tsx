import { createRoot } from 'react-dom/client';
import './app.global.scss';
import { BloomRPC } from './components/BloomRPC';

document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById('root')!).render(<BloomRPC />);
});
