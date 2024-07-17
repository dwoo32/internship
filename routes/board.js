const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const db = require('../models/db');
const multer = require('multer');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 파일 업로드 경로 설정
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일명 설정: 현재 시간 + 파일 확장자
    }
});

const upload = multer({ storage: storage });

// 게시글 목록 보기
router.get('/', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM boards');
    res.render('index', { title: '게시글 목록', boards: rows });
});

// 게시글 작성 폼
router.get('/new', (req, res) => {
    res.render('new', { title: '새 게시글 작성' });
});

// 게시글 작성
router.post('/', upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;
    const nickname = req.session.user.nickname; // 로그인한 사용자의 닉네임 가져오기
    await pool.query('INSERT INTO boards (title, content, image, nickname) VALUES (?, ?, ?, ?)', [title, content, image, nickname]);
    res.redirect('/boards');
});

//게시글 보기
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM boards WHERE id = ?', [req.params.id]);
        const board = rows[0];
        res.render('show', { title: '게시글 보기', board });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { title: '서버 에러' }); // 수정된 부분
    }
});




// 게시글 수정 폼
router.get('/:id/edit', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    res.render('edit', { title: '게시글 수정', board: rows[0] });
});

// 게시글 수정
router.put('/:id', upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : req.body.currentImage;
    await pool.query('UPDATE boards SET title = ?, content = ?, image = ? WHERE id = ?', [title, content, image, req.params.id]);
    res.redirect(`/boards/${req.params.id}`);
});

// 게시글 삭제
router.delete('/:id', async (req, res) => {
    await pool.query('DELETE FROM boards WHERE id = ?', [req.params.id]);
    res.redirect('/boards');
});

module.exports = router;
