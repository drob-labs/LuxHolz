import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // three.js is lazy-loaded in its own chunk with the hero scene
  build: { chunkSizeWarningLimit: 600 },
})
