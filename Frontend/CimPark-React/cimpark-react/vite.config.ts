import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/cimpark/', // Cambia el path base para que coincida con la carpeta en tu servidor
  plugins: [react(), tsconfigPaths()],
})
