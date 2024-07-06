const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const multer = require('multer');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
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
    await pool.query('INSERT INTO boards (title, content, image) VALUES (?, ?, ?)', [title, content, image]);
    res.redirect('/boards');
});

// 게시글 보기
router.get('/:id', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    res.render('show', { title: '게시글 보기', board: rows[0] });
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
