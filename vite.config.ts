import { loadEnv, defineConfig } from 'vite';
import unheadVite from '@unhead/addons/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const ENV = loadEnv(mode, process.cwd());

    return {
        plugins: [react(), unheadVite()],
        root: path.resolve(__dirname),
        publicDir: 'public',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        //只在development下有效
        server: {
            proxy: {
                [ENV.VITE_API_PROXY_URL]: {
                    target: ENV.VITE_LOCAL_API_URL,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    };
});
