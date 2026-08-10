const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');

const config = require('./config/key');
const { auth } = require('./middleware/auth');

// application/x-www-form-urlencoded 데이터를 분석하여 가져올 수 있도록 하는 코드
app.use(bodyParser.urlencoded({extended: true}));

// application/json 데이터를 분석하여 가져올 수 있도록 하는 코드
app.use(bodyParser.json());

// 쿠키 데이터를 분석하여 가져올 수 있는 코드
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('정말 재미있는 Node.js~ 여러분도 함께해요!');
});

app.post('/api/users/register', async (req, res) => {
  // 회원 가입할 때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터베이스에 넣어준다.
  const user = new User(req.body);

  try {
    await user.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.json({ success: false, err });
  }

});

app.post("/api/users/login", async (req, res) => {
  try {
    // 요청된 이메일을 데이터베이스에서 있는지 확인한다.
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      });
    }
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인한다.
    const isMatch = await user.comparePassword(req.body.password);
    if(!isMatch) {
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다."
      });
    }
    // 비밀번호까지 맞다면 토큰을 생성한다.
    const updateUser = await user.generateToken();
    // 토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지, 세션 등에 저장한다.
    // 어디가 안전한지는 여러가지 의견이 있다. 일단 여기 실습에서는 쿠키에 저장한다.
    return res.cookie("x_auth", updateUser.token)
      .status(200)
      .json({ loginSuccess: true, userId: updateUser._id });
  } catch (err) {
    return res.status(400).json({ loginSuccess: false, err})
  }
});

app.get('/api/users/auth', auth, async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});