const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();

const indexRouter = require('./routes');

const app = express();
app.set('port', process.env.PORT || 4000);
app.set('view engine', 'html');

nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use('/', indexRouter);

app.use((req, res, next) => {
  const error = new Error(`No router for ${req.method}, ${req.url}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.log(err.message);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV != 'production' ? err : {};
  res.status(err.status | 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')}`);
});