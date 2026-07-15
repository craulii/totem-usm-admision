import { useEffect, useRef } from 'react';

// Renderless kiosk idle watcher: after `timeout` seconds with no user input it
// calls onIdle() so the app can return to the Attract screen. Any tap/key resets
// the countdown. With enabled=false it installs nothing (used so the timer never
// runs on the Attract screen itself).
export default function IdleReset({ timeout = 45, onIdle, enabled = true }) {
  const timer = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const reset = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onIdle, timeout * 1000);
    };
    const events = ['pointerdown', 'touchstart', 'keydown'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start the countdown on mount / whenever the screen changes
    return () => {
      clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [enabled, timeout, onIdle]);
  return null;
}
