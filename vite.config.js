var path = require('path')
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'


export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'vdtree'
        },
        minify: false
    }
})