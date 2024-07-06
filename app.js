const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const app = express();
const port = 3000;

app.engine('ejs', ejsMate); // ejs-mate 사용 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.redirect('/boards');
});

const boardRouter = require('./routes/board');
app.use('/boards', boardRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
