# 백엔드 프로그래밍: Node.js의 Koa 프레임워크

웹 애플리케이션을 만들 때는 리엑트 같은 프론트엔드 기술만으로 필요한 기능을 구현할 수 없는 경우가 있어

데이터를 여러 사람과 공유하려면 저장할 공간이 필요하다.<br />

### 백엔드

서버에 데이터를 담을 때는 여러 가지 규칙이 필요하다.

데이터를 등록할 때 사용자 인증 정보가 필요할 수도 있고, 등록할 데이터를 어떻게 검증할지, 데이터의 종류가 다양하다면 어떻게 구분할지 등 고려해야 할 것 들이 있다.

데이터를 조회할 때도 마찬가지이다. 어떤 종류의 데이터를 몇개씩 보여 줄지, 어떻게 보여 줄지 와 같은 로직을 만드는 것을 서버 프로그래밍, 백엔드 프로그래밍이라 한다.


### Node.js

자바스크립트 엔진을 기반으로 웹 브라우저뿐 아니라 서버에서도 자바스크립트를 사용할 수 있는 런타임이 개발되었는데, 이것이 Node.js이다.

### Koa

Node.js 환경에서 웹 서버를 구축할 때 보통 Express, Hapi, Koa 등의 웹 프레임워크를 사용한다.

Express는 미들웨어, 라우팅, 템플릿, 파일 호스팅 등과 같은 다양한 기능이 자체적으로 내장되어 있는 반면, 

Koa는 미들웨어 기능만 갖추고 있다. 나머지는 다른 라이브러리를 적용해야 한다.

라이브러리를 따로 적용해줘야 하는 번거로움이 있지만 그만큼 필요한 기능만 적용할 수 있어 Express 보다 가볍다.<br />

Koa는 async/await 문법을 정식으로 지원하기 때문에 비동기 작업을 더 편하게 관리할 수 있다.


## 작업 환경 준비

```
$ mkdir blog
$ cd blog
$ mkdir blog-backend
$ cd blog-backend
$ yarn init -y
```
mkdir로 폴더를 생성해줘도 되지만 탐색기를 이용해 직접 폴더를 생성해줘도 된다.


```
$ cat package.json
```
package.json도 blog-backend에서 직접 생성해줘도 된다.


```
$ yarn add koa
$ yarn add --dev eslint
$ yarn run eslint --init
? How would you like to use ESLint? To check syntax and find problems
? What type of modules does your project use? CommonJS (require/exports)
? Which framework does your project use? None of these
? which framework does your project use? No
? Where does your code run? Node 
? What format do you want your config file to be in? JSON
```

`.prettierrc` 생략


```
$ yarn add eslint-config-prettier
```

`.eslintrc.json`
```json

...

"extends" : ["eslint:recommended", "prettier"],

...

"rules": {
  "no-unused-vars": "warn",
  "no-console": "off"
}
```
eslint가 const를 선언하고 사용하지 않아서 오류로 간주하기 때문에 제외시켜줘야 한다.




```js
// scr/main.js
// 수정 전
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error(e);
  });

// 수정 후
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error(e);
  });
```
여기서 `useNewUrlParser`, `useFindAndModify`는 사용할 수 없다.
몽구스의 버전이 6.0 이상이라면(4.4도 포함되는것 같다.)
`useNewUrlParser: true`, `useUnifiedTopology: true`, `useCreateIndex: true`, `useFindAndModify: false` 가 기본값이기 때문에 생략해도 된다.

서버 실행
```
$ node src
```


## 미들웨어

미들웨어 함수의 구조
```js
(ctx, next) => {
}
```

Koa의 미들웨어 함수는 두 개의 파라미터를 받는다.

첫 번째 파라미터는 ctx, 두 번째 파라미터는 next(next는 생략해도 된다.)

```js
const Koa = require('koa');
const app = new Koa();

app.use((ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  next();
});

app.use((ctx, next) => {
  console.log(2);
});

app.listen(4000, () => {
  console.log('Listening to port 4000');
});
```

실행 화면
```
Listening to port 4000
/
1
2
/favicon.ico
1
2
```

next()는 다음 미들웨어 실행시킨다.

미들웨어에 여러 조건을 포함할 수 있다.

예를 들어 authorized=1 이라는 쿼리 파라미터가 없으면 다음 미들웨어를 처리하지 않게 할 수도 있다.

```js
app.use((ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  if(ctx.query.authorized !== '1'){
    ctx.status = 401; // Unauthorized
    return;
  }
  next();
});
```

## async / await

```js
app.use(async (ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  if(ctx.query.authorized !== '1'){
    ctx.status = 401; // Unauthorized
    return;
  }
  await next();
  console.log('END');
});
```

## nodemon

nodemon을 사용하면 코드를 변경(저장)할 때마다 서버를 자동으로 재시작 해준다.
```
$ yarn add -dev nodemon
```

package.json
```json
...
"scripts": {
  "start": "node src",
  "start:dev": "nodemon --watch src/ src/index.js"
}
```

`$ yarn start:dev` 명령어를 실행하고 index.js에서 기존 미들웨어를 모두 제거하고 저장하면 서버가 재실행 된다.


## koa router

```
$ yarn add koa-router
```

```js
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/', ctx => {
  ctx.body = '홈';
});
router.get('/about', ctx => {
  ctx.body = '소개';
});

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log('Listening to port 4000');
});
```
http://localhost:4000 에 접속하면 '홈'
http://localhost:4000/about 에 접속하면 '소개' 



## 라우트 파라미터와 쿼리

https://thebook.io/080203/ch21/05/02/




## mongodb

mongodb를 설치해야 하는데
현재 버전인 6.0 보다 4.4를 권장

```
$ yarn add mongoose dotenv
```
dotenv는 환경변수를 파일에 넣고 사용할 수 있게 하는 개발 도구입니다.

mongoose를 사용하여 mongodb에 접속할 때, 서버에 주소나 계정 및 비밀번호가 필요한 경우도 있다.

민감하거나 환경별로 다라질 수 있는 값은 코드 안에 직접 작성하지 않고, 환경변수로 설정하는 것이 좋습니다.

(.gitignore로 환경변수가 들어있는 파일은 제외시켜 주는것이 좋다.)


루트 디렉터리(blog-backend)에 .env 파일 생성
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/blog
```
blog는 데이터베이스의 이름으로 자동으로 생성되기 때문에 미리 생성할 필요는 없다.




























## MongoDb Compass











```
$ yarn add Joi
```
```js
// Joi
// 바뀌기 전 문법
const result = Joi.validate(ctx.request.body, schema);
if(result.error){
  ctx.status = 400;
  ctx.body = result.error;
  return;
}

// 바뀐 문법
const validation = schema.validate(ctx.request.body);
if(validation.error){
  ctx.status = 400;
  ctx.body = validation.error;
  return;
}

```


## JWT

JWT는 JSON Web Token의 약자로, 데이터가 JSON으로 이루어져 있는 토큰을 의미한다.
두 개체가 서로 안전하게 정보를 주고받을 수 있도록 웹 표준으로 정의된 기술이다.

### 세션 기반 인증과 토큰 기반 인증의 차이

세션 기반: 서버가 사용자의 로그인 상태를 기억

토큰 기반: 서버가 사용자의 로그인 이후 토큰을 발급

토큰에는 사용자의 로그인정보와 서버에서 발급되었음을 증명하는 서명이 들어있다.

서명데이터는 해싱 알고리즘을 통해 만들어진다.

서버에서 만든 토큰은 서명이 있기 때문에 무결성이 보장된다.


