import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const theme = localStorage.getItem('aniflow_theme') || 'cinematic';
if (theme === 'amoled') {
  document.documentElement.classList.add('theme-amoled');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
