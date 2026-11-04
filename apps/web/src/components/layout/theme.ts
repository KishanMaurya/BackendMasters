export const THEME_STORAGE_KEY = 'bm-theme';

/** Runs before first paint, so a saved light theme never flashes dark. */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light')document.documentElement.classList.remove('dark')}catch(e){}`;
