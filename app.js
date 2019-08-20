var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

var dashboardRouter = require('./routes/dashboard');
var publicRouter = require('./routes/public');

var app = express();

// Authentication
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-537223.okta.com',
  token: ' 00M5Y2y5p_dMUdZgVq20xhXhAaUVdni3_xjzhfmpW0'
})

const oidc = new ExpressOIDC({
  issuer: 'https://dev-537223.okta.com/oauth2/default',
  client_id: '0oa15h5vu4nqQZr2T357',
  client_secret: 'eKMj8ucuo6hTlybjyh9IFJc-HACkbKrDEoB1Sa2d',
  redirect_uri: 'http://localhost:3000/user/callback',
  scope: 'openid profile',
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "users/callback",
      defaultRedirect: "/dashboard"
    }
  }
})

app.use(session({
  secret: 'asdf;lkjh3lkjh235l23h5l235kjh',
  resave: true,
  saveUninitialized: false
}))
app.use(oidc.router)

app.use((req, res, next) => {
  if(!req.userinfo){
    return next()
  }

  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user
      res.locals.user = user
      next()
    }).catch(err => {
      next(err)
    })
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', publicRouter);
app.use('/dashboard', dashboardRouter);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'fgasdfgasdfq2345wegzfdg3445n76s5s7sb5gtdr57',
  resave: true,
  saveUninitialized: false
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
