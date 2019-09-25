const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const expressWS = require('express-ws')(app);

let mongoose = require('mongoose');
let MongoStore = require('connect-mongo')(session);
let mongoConfig = require('./config/mongoConfig');
mongoose.connect(`mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`)
    .then(() => {
        console.log('连接数据库成功');
        init();
    }, (error) => {
        console.error('连接数据库失败');
        console.error(error);
    });

function init () {
    let login = require('./routes/login');
    let signUp = require('./routes/sign_up');
    let init = require('./routes/init');
    let ws = require('./routes/ws');

    // uncomment after placing your favicon in /public
    // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser('blog'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({
        name: 'anywe',
        secret: 'blog', //secret的值建议使用随机字符串
        ttl: 60 * 1000 * 60 * 24, //过期时间
        saveUninitialized: false,
        resave: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection //使用已有的数据库连接
        })
    }));

    app.use('/sign_up', signUp);
    app.use('/login', login);
    // app.use('/init', init);
    app.use('/init', init);
    app.use('/ws', ws);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}

module.exports = app;
