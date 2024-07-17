require('dotenv').config(); // 환경 변수 사용을 위해 dotenv 패키지 추가
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const { exec } = require('child_process'); // child_process 모듈 추가

const app = express();

const userRouter = require('./routes/user');
const boardRouter = require('./routes/board');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.use(express.urlencoded({ extended: false })); // body-parser 대신 express 내장 함수 사용
app.use(express.json()); // body-parser 대신 express 내장 함수 사용
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.use('/user', userRouter);
app.use('/boards', checkAuth, boardRouter);

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/user/login');
    }
}

app.get('/', (req, res) => {
    res.redirect('/user/login');
});

// /chat 엔드포인트 추가
app.post('/chat', (req, res) => {
    const userPrompt = req.body.prompt;

    exec(`python chatbot.py "${userPrompt}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            res.status(500).send(error.message);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            res.status(500).send(stderr);
            return;
        }
        res.send(stdout.trim());
    });
});

// 게시물 목록과 채팅봇이 함께 있는 페이지
app.get('/boards_with_chat', checkAuth, async (req, res) => {
    const boards = await pool.query('SELECT * FROM boards');
    res.render('index_with_chat', { boards });
});


// 에러 처리 미들웨어 추가
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
