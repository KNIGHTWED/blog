import Joi from "joi";
import User from "../../models/user";

// 회원가입
export const register = async ctx => {
  console.log('Register');
  // Request Body 검증하기
  const schema = Joi.object().keys({
    username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required(),
    password: Joi.string().required(),
  });

  const validation = schema.validate(ctx.request.body);
  if(validation.error){
    ctx.status = 400;
    ctx.body = validation.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    const exists = await User.findByUsername(username);
    if(exists) {
      ctx.status = 409 // Conflict
      return;
    }

    const user = new User({
      username,
    });

    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장
    
    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();

    const token = user.generateToken();
      ctx.cookies.set('access_token', token, {
        maxAge: 1000*60*60*24*7, // 1000(ms) * 60(초) * 60(분) * 24(시간) * 7(일) = 7일
        httpOnly: true,
    });

  } catch (e) {
    ctx.throw(500, e);
  }
};

// 로그인
export const login = async ctx => {
  console.log('Login')
  const { username, password } = ctx.request.body;

  // username, password가 없으면 에러 처리
  if(!username || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }

  try {
    const user = await User.findByUsername(username);
    //계정이 존재하지 않으면 에러처리
    if(!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    // 잘못된 비밀번호
    if(!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000*60*60*24*7, // 1000(ms) * 60(초) * 60(분) * 24(시간) * 7(일) = 7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 로그인 상태 확인
export const check = async ctx => {
  console.log('Check');
  const { user } = ctx.state;
  if(!user) {
    // 로그인 중 아님
    ctx.status = 401;
    return;
  }
  ctx.body = user;
};

  // 로그아웃
export const logout = async ctx => {
  console.log('logout');
  ctx.cookies.set('access_token');
  ctx.status = 204;
};