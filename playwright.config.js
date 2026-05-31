import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default defineConfig({
    testDir: './tests/accessibility',
    use: {
        baseURL: process.env.APP_URL || 'http://localhost:8000',
        headless: true,
    },
});
