import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shrishyam.properties',
  appName: 'Shri Shyam Properties',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.13:3000',
    cleartext: true
  }
};

export default config;
