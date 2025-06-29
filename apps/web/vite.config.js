import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    server: {
        proxy: {
            '/functions': {
                target: 'http://localhost:54321',
                changeOrigin: true,
            },
        },
    },
});
