let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let MongoStore = require('connect-mongo')(session);
let mongoConfig = require('./config/mongoConfig');
mongoose.connect(`mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/app`)
    .then(() => {
        console.log('连接数据库成功');
    }, (error) => {
        console.error('连接数据库失败');
        console.error(error);
    });
let login = require('./routes/login');
let signUp = require('./routes/signUp');
let init = require('./routes/init');

let app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('blog'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');
app.use(session({
    secret: 'blog', //secret的值建议使用随机字符串
    cookie: { maxAge: 60 * 1000 * 60 * 24 * 14 }, //过期时间
    saveUninitialized: false,
    resave: true,
    store: new MongoStore({
        mongooseConnection: mongoose.connection //使用已有的数据库连接
    })
}));

app.use('/signUp', signUp);
app.use('/login', login);
app.use('/init', init);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
