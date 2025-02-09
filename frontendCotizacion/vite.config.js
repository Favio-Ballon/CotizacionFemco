import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0', // Or 'localhost'
    
    // Allow other URLs like test.cotizafemco.com
    cors: {
      origin: ['http://test.cotizafemco.com'],
      credentials: true
    },
    allowedHosts: ['www.cotizafemco.com']
  }

})
