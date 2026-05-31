import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/accessibility',
    use: {
        baseURL: process.env.APP_URL || 'http://localhost:8000',
        headless: true,
    },
});
