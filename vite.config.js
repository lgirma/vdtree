var path = require('path')
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import svelte from '@sveltejs/vite-plugin-svelte'


export default defineConfig({
    plugins: [reactRefresh(), svelte()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'vdtree'
        },
        rollupOptions: {

        }
    }
})