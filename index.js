const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const { User } = require('./models/User');

const config = require('./config/key');

// application/x-www-form-urlencoded 데이터를 분석하여 가져올 수 있도록 하는 코드
app.use(bodyParser.urlencoded({extended: true}));

// application/json 데이터를 분석하여 가져올 수 있도록 하는 코드
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('정말 재미있는 Node.js~ 여러분도 함께해요!');
});

app.post('/register', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});