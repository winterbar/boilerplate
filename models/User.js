const mongoose = require('mongoose'); // Mongoose 라이브러리 로드
const bcrypt = require('bcrypt');
const saltRounds = 10; // 생성되는 salt의 자리수
const jwt = require('jsonwebtoken');

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

userSchema.pre('save', async function() {
    var user = this;
    if(user.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;
        } catch (err) {
            throw err;
        }
    }
});

userSchema.methods.comparePassword = async function(plainPassword) {
    try {
        // bcrypt.compare는 promise를 지원하므로 await 사용 가능
        const isMatch = await bcrypt.compare(plainPassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

userSchema.methods.generateToken = async function() {
    // jsonwebtoken을 이용해서 토큰을 생성
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    // user._id + secretToken => 토큰 생성. 이후 secretToken으로 user._id를 찾을 수 있다.
    // 따라서 secretToken을 기억해줘야 한다.
    user.token = token;

    // user.save도 promise를 반환하므로 await 사용
    try {
        await user.save();
        return user;
    } catch (err) {
        throw err;
    }
}

userSchema.statics.findByToken = async function(token) {
    var user = this;

    try {
        var decoded = await jwt.verify(token, "secretToken")

        var authedUser = await user.findOne( {"_id": decoded, "token": token } );
        return authedUser;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema);

module.exports = { User } // 다른 곳에서도 쓸 수 있게 모듈화