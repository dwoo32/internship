const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');

const app = express();

const userRouter = require('./routes/user');
const boardRouter = require('./routes/board');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts); // 추가
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// 로그인 상태 확인 미들웨어
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/user/login');
    }
}

app.use('/user', userRouter);
app.use('/boards', checkAuth, boardRouter);

app.get('/', (req, res) => {
    res.redirect('/user/login');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
