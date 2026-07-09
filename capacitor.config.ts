import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cortilow.app',
  appName: 'Cortilow',
  webDir: 'public',
  server: {
    // L'app charge ton site Vercel en direct.
    // Vercel continue de gérer tout le serveur (API Claude, Stripe, Supabase).
    url: 'https://glowup-mvp.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
