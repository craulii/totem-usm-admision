// Brand tokens. USM navy stays the base; the "+Mujeres en STEM" campaign palette
// (cyan / yellow / purple) is layered on top as accents. Centralised so the same
// hex is reused across menu, cards, ticket and register instead of drifting.
export const BRAND = {
  cyan: '#2CC9D6',    // the "+" of the Mujeres logo
  yellow: '#EEE73B',  // the STEM box outline
  purple: '#5B3FD6',  // the banner
  usmNavy: '#002a5c',
  bg: '#0a0f1e',      // app background (unchanged)
};

// Logo asset URLs, resolved through Vite's BASE_URL (same pattern as qr-registro.png)
// so they work under the GitHub Pages base and the file:// APK build alike.
export const logo = (name) => `${import.meta.env.BASE_URL}logos/${name}`;
