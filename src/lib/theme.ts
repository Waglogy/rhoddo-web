export const THEME_STORAGE_KEY = 'rhoddo-theme';

/**
 * Runs before the page paints (see the root layout), so saved dark mode never
 * flashes light. Light is the default, whatever the device is set to.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;
