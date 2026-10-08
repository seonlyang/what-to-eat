import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Local development stays at `/`; production assets use the repository path on GitHub Pages.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/what-to-eat/' : '/',
  plugins: [tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
