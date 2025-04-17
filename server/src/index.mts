import Koa from 'koa';
//import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
// @ts-ignore
import pingRouter from './routes/ping.mts';
// @ts-ignore
import structureRouter from './routes/structure.mts';
// @ts-ignore
import fileRouter from './routes/file.mts';

const app = new Koa();
//const router = new Router();

// Global middleware
app.use(cors());
app.use(bodyParser());

// 👇 Add router middleware
app.use(pingRouter.routes());
app.use(pingRouter.allowedMethods());

app.use(structureRouter.routes());
app.use(structureRouter.allowedMethods());

app.use(fileRouter.routes());
app.use(fileRouter.allowedMethods());

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
