import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/shell/App.tsx';
import './styles/index.css';

// ─── Console Banner ───────────────────────────────────────────────────────────
const RESET  = 'color: inherit; font-size: 12px; font-weight: normal;';
const BOLD   = 'font-weight: 700; font-size: 13px;';
const ACCENT = 'color: #FFC107; font-weight: 700; font-size: 13px;';
const DIM    = 'color: #888; font-size: 11px;';
const WARN   = 'color: #e53e3e; font-weight: 600; font-size: 12px;';

console.log(
  '%c\n' +
  '██████╗ ███████╗████████╗████████╗███████╗██████╗ \n' +
  '██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗\n' +
  '██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝\n' +
  '██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗\n' +
  '██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║\n' +
  '╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝\n' +
  '██╗     ██╗██████╗ ███╗   ███╗ █████╗ ███╗   ██╗ █████╗ ███╗   ██╗\n' +
  '██║     ██║██╔══██╗████╗ ████║██╔══██╗████╗  ██║██╔══██╗████╗  ██║\n' +
  '██║     ██║██████╔╝██╔████╔██║███████║██╔██╗ ██║███████║██╔██╗ ██║\n' +
  '██║     ██║██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║╚██╗██║\n' +
  '███████╗██║██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║██║ ╚████║\n' +
  '╚══════╝╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝\n',
  'color: #FFC107; font-weight: bold; font-size: 11px; line-height: 1.4;'
);

console.log('%cBetterLibmanan.org%c — Official Portal of Libmanan, Camarines Sur', ACCENT, RESET);
console.log('%c─────────────────────────────────────────────────────────────────', DIM);
console.log('%cVersion     %c1.0.0',             BOLD, RESET);
console.log('%cEnvironment %c' + (import.meta.env.MODE ?? 'development'), BOLD, RESET);
console.log('%cPlatform    %cReact 18 · Vite · TypeScript · TailwindCSS',  BOLD, RESET);
console.log('%cLicense     %cCC0-1.0 (Creative Commons Zero)',              BOLD, RESET);
console.log('%c─────────────────────────────────────────────────────────────────', DIM);
console.log('%cCreated & maintained by %cenzox0/BetterLibmanan.org Team', RESET, ACCENT);
console.log('%cRepository  %chttps://github.com/enzox0/betterlibmanan', BOLD, RESET);
console.log('%c─────────────────────────────────────────────────────────────────', DIM);
console.log(
  '%c⚠  Hey there, curious dev! If you find any bugs or want to contribute,\n' +
  '   feel free to open an issue or pull request on our repository.',
  WARN
);
console.log('%c─────────────────────────────────────────────────────────────────\n', DIM);
// ──────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
