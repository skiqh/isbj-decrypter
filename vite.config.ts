import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import the Tailwind plugin

// https://vitejs.dev/config/
export default defineConfig({
	base: '/isbj-decrypter/',
	plugins: [
		react(),
		tailwindcss(), // Add tailwindcss plugin
	],
})
