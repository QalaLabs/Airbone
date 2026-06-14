import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three-core'
          if (id.includes('@react-three/')) return 'r3f'
          if (id.includes('gsap') || id.includes('framer-motion')) return 'animation'
        },
      },
    },
  },
})
