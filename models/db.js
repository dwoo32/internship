const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // MySQL 사용자 이름
    password: 'kim5985@', // MySQL 비밀번호
    database: 'board_app'
});

module.exports = pool;
