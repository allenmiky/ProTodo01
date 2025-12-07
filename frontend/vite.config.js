import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from Ngrok / LAN
    port: 5173,
    cors: true,
    allowedHosts: ['*.ngrok-free.app', '*.ngrok.io','kvpuulgyp4.loclx.io'],
  }
})