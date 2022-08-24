import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 입력한 비밀번호를 hashedPassword로 변환
UserSchema.methods.setPassword = async function(password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

// 입력한 비밀번호와 해당 계정의 비밀번호가 일치하는지 검증
UserSchema.methods.checkPassword = async function(password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

UserSchema.methods.serialize = function() {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
}

// username으로 데이터를 찾을 수 있게 해준다.
UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

UserSchema.methods.generateToken = function() {
  const token = jwt.sign(
    // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣습니다.
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
  return token;
};

const User = mongoose.model('User', UserSchema);

export default User;