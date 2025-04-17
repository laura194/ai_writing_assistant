import Router from '@koa/router';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/fileContent.json');

const router = new Router({ prefix: '/api' });

router.get('/file/:id', async (ctx) => {
    const fileId = ctx.params.id;
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        const files = JSON.parse(data);
        const file = files.find((f: any) => f.id === fileId);
        if (!file) {
            ctx.status = 404;
            ctx.body = { error: 'File not found' };
        } else {
            ctx.body = file;
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to load file' };
    }
});

export default router;
