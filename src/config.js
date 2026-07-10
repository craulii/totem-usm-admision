// Central app config. Values here are the defaults; the admin panel (Fase 4)
// will be able to override them via Supabase `config`.

// Seconds per game. Client wants this switchable between 30 and 60 from admin.
// ponytail: a plain constant until the admin panel exists to change it.
export const GAME_DURATION = 60;

// URL that the menu QR points to (the registration page opened on the phone).
// If you change it, regenerate the QR image:
//   npx qrcode -o public/qr-registro.png "<URL>"
export const REGISTER_URL = 'https://craulii.github.io/totem-usm-admision/?registro';
