import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Aplicar preferencias salvas ANTES de renderizar para evitar flash visual.
const savedTheme = localStorage.getItem('altis.theme');
document.documentElement.setAttribute('data-bs-theme', savedTheme === 'dark' ? 'dark' : 'light');

const savedFontLevel = localStorage.getItem('altis.fontSize');
const validLevels = ['sm', 'md', 'lg', 'xl'];
const level = (savedFontLevel && validLevels.includes(savedFontLevel)) ? savedFontLevel : 'md';
document.documentElement.classList.add(`font-${level}`);

const savedLang = localStorage.getItem('altis.lang');
document.documentElement.lang = savedLang === 'en' || savedLang === 'es' ? savedLang : 'pt';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
