import { defineConfig } from 'vite'        // Vite's config helper
import react from '@vitejs/plugin-react'    // Tells Vite to understand React/JSX
import tailwindcss from '@tailwindcss/vite' // Connects Tailwind to Vite

export default defineConfig({
  plugins: [
    react(),       // Enable React support
    tailwindcss(), // Enable Tailwind CSS
  ],
})