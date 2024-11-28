import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('/home/Neo/Desktop/AWS-Ganzert/my-ssl-certs/localhost.key'), // Path to your private key
      cert: fs.readFileSync('/home/Neo/Desktop/AWS-Ganzert/my-ssl-certs/localhost.crt'), // Path to your certificate
    },
    // Optionally, specify a port
    port: 3000,
  },
});