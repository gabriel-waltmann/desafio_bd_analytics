import Koa from 'koa';
import dotenv from 'dotenv';
import DataSource from './database/DataSource';
import router from '@/routes';
import bodyParser from 'koa-bodyparser';

const PORT = process.env.PORT || 3000;
const app = new Koa();

dotenv.config();

DataSource.initialize()
  .then(db => {
    app.context.db = db;
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
 
app.use(bodyParser());
  
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

app.use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

