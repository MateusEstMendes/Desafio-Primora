import React from 'react';
import ReactDOM from 'react-dom/client';
import './components/componentsCSS/tokens.css';
import App from './App';
import { applyThemeTokens } from './utils/themeTokens';

let initialTheme = 'light';
try { initialTheme = localStorage.getItem('color-scheme') || 'light'; } catch {}
applyThemeTokens(initialTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
