import Router from '@koa/router';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/projectStructure.json');

const router = new Router({ prefix: '/api' });

router.get('/structure', async (ctx) => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        ctx.body = JSON.parse(data);
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to load project structure' };
    }
});

export default router;
