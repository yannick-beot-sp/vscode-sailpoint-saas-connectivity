import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({
    plugins: [svelte()],
    build: {
        rollupOptions: {
            output: {
                dir: '../../../connector-tester',
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]'
            }
        }
    }
});
//# sourceMappingURL=vite.config.js.map