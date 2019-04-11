const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const router = require('koa-router')();
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const koajwt = require('koa-jwt');
const cors = require('koa2-cors');
const Api = require('./lib/routes/route');

require('./lib/config/mongoose-client');

const config = require('./config');
const logUtil = require('./utils/log_util');

// error handler
onerror(app);

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));
app.use(json());
app.use(logger());

app.use(async (ctx, next) => {
  const start = new Date()
  let ms;
  try {
    await next();
    ms = new Date() - start;
    // 记录响应日志
    logUtil.logResponse(ctx, ms);
  } catch (error) {
    ms = new Date() - start;
    // 记录异常日志
    logUtil.logError(ctx, error, ms);
  }
});

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

app.use(cors({
  origin: function(ctx) {
    console.log('url:', ctx.url);
    if (ctx.url === '/test') {
      return false;
    }
    return '*';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 300,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(koajwt({
  secret: 'my_token'
}).unless({
  path: [/\/api\/v1\/login/, /\/api\/v1\/signup/, /\/api\/v1\/qiniu-token/, /\/api\/v1\/notice\/mock/]
}));

const checkToken = require('./lib/middleware/check-token');
app.use(checkToken);

// routes
router.use('/api/v1', Api.routes(), Api.allowedMethods);
app.use(Api.routes(), Api.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app;
