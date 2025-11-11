import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || !!process.env.VERCEL

// https://vite.dev/config/
export default defineConfig({
  base: isVercel ? '/' : '/rydr-frontend/',
  plugins: [react()],
})
