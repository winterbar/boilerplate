const { User } = require("../models/User");

// 인증을 하는 곳
let auth = async (req, res, next) => {
    try {
        // 클라이언트 쿠키에서 토큰을 가져온다.
        const token = req.cookies.x_auth;

        // 토큰을 복호화한 후 유저를 찾는다.
        const user = await User.findByToken(token);

        if(!user) {
            return res.json({ isAuth: false, error: true });
        }

        req.token = token;
        req.user = user;

        next();
    } catch (err) {
        throw err;
    }
}

module.exports = { auth };