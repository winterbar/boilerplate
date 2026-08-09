const mongoose = require('mongoose'); // Mongoose 라이브러리 로드

const userSchema = mongoose.Schema({ // Mongoose 스키마 선언
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: { // 토큰으로 유효성 관리 목적
        type: String
    },
    tokenExp: { // 토큰 유효 기간
        type: Number
    }
});

const User = mongoose.model('User', userSchema);

module.exports = { User } // 다른 곳에서도 쓸 수 있게 모듈화