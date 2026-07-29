// Brand tokens for the "Ensayo Nacional PAES" identity (2026-07 reskin). Centralised
// so the same values are reused across every totem screen instead of drifting —
// Register.jsx/Ticket.jsx/AdminPage.jsx intentionally do NOT use these, they keep
// the old Geom Graphic look on purpose (client decision, out of scope for this reskin).
export const BRAND = {
  orange: '#f19a5c',
  yellow: '#f9db6f',
  accentYellow: '#ffde59', // timer rings / small accents, brighter than the button-gradient yellow
  green1: '#89d957',
  green2: '#c9e265',
  purple: '#cb6ce6',       // QR panel, HUD panels, HIGH SCORES pill
  navy: '#00357a',         // board / HUD-panel dark background
  tileBlue: '#99daff',     // light-blue tile/card color
  cardBack: '#4d69a4',     // mid-blue card back

  gradientButton: 'linear-gradient(135deg, #f19a5c 0%, #f9db6f 100%)',
  gradientRanking: 'linear-gradient(135deg, #89d957 0%, #c9e265 100%)',
  textOnLight: '#1a1a2e', // dark text for the orange/yellow and green gradient surfaces

  font: "'Arcade Gamer', 'Segoe UI', system-ui, sans-serif",
  fontLegacy: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", // QR-instructions block only

  bg: '#0b1740', // solid fallback painted under the background image
};

// Logo asset URLs, resolved through Vite's BASE_URL (same pattern as qr-registro.png)
// so they work under the GitHub Pages base and the file:// APK build alike.
export const logo = (name) => `${import.meta.env.BASE_URL}logos/${name}`;

// Full-bleed background image, same BASE_URL resolution as logo().
export const bgImage = () => `${import.meta.env.BASE_URL}images/fondo-ensayo.png`;
