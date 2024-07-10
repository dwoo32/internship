const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../models/db');

// 회원가입 폼
router.get('/register', (req, res) => {
    res.render('register', { title: '회원가입' });
});

// 회원가입 처리
router.post('/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)', [username, hashedPassword, nickname]);
    res.redirect('/user/login');
});

// 로그인 폼
router.get('/login', (req, res) => {
    res.render('login', { title: '로그인', error: null });
});

// 로그인 처리
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.user = user;
            res.redirect('/boards');
        } else {
            res.render('login', { title: '로그인', error: '비밀번호가 일치하지 않습니다.' });
        }
    } else {
        res.render('login', { title: '로그인', error: '사용자를 찾을 수 없습니다.' });
    }
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/user/login');
});

module.exports = router;
