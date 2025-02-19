import Koa from 'koa';
import dotenv from 'dotenv';

const PORT = process.env.PORT || 3000;
const app = new Koa();

dotenv.config();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.on('error', err => {
  console.error('server error', err)
});

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.use(async ctx => {  
  ctx.body = `Server running on port ${PORT}`;
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

