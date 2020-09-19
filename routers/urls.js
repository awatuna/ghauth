/* routers/urls.js */

const Router = require('koa-router');
const static = require('koa-static');

module.exports = (app) => {
    const rootRouter = new Router();

    // ./
    const indexRouter = require('./index');
    rootRouter.use('/', indexRouter.routes(), indexRouter.allowedMethods());

    // ./login/
    const loginRouter = require('./login');
    rootRouter.use('/login', loginRouter.routes(), loginRouter.allowedMethods());

    // ./logout/
    const logoutRouter = require('./logout');
    rootRouter.use('/logout', logoutRouter.routes(), logoutRouter.allowedMethods());

    // ./register/
    const registerRouter = require('./register');
    rootRouter.use('/register', registerRouter.routes(), registerRouter.allowedMethods());

    // ./api/
    const apiRouter = require('./api');
    rootRouter.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
    
    // ./textures/
    const texturesRouter = require('./textures');
    rootRouter.use('/textures', texturesRouter.routes(), texturesRouter.allowedMethods());

    //静态文件路由
    app.use(static("./public")); 

    app.use(rootRouter.routes());
}