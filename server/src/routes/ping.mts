import Router from '@koa/router';

const router = new Router();

router.get('/ping', async (ctx) => {
  ctx.body = {
    message: 'pong 🏓',
  };
});

export default router;
