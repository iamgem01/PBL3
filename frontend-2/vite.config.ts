import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    ['babel-plugin-react-compiler', {
                        // Optional configuration
                        // target: '19' // Specify React version
                    }]
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@pages': path.resolve(__dirname, './src/pages'),
        },
    },
    define: {
        global: 'globalThis',
    },
    server: {
        port: 5000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    }
})